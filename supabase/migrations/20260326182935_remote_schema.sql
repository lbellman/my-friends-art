SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
COMMENT ON SCHEMA "public" IS 'standard public schema';
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
CREATE TYPE "public"."art_mediums" AS ENUM (
    'oil',
    'acrylic',
    'watercolor',
    'pastel',
    'pencil',
    'digital',
    'mixed-media',
    'needle-felt',
    'crochet',
    'knit',
    'pen',
    'wood',
    'clay',
    'paper-machet',
    'pottery',
    'other'
);
ALTER TYPE "public"."art_mediums" OWNER TO "postgres";
CREATE TYPE "public"."art_piece_statuses" AS ENUM (
    'pending-approval',
    'approved',
    'not-approved'
);
ALTER TYPE "public"."art_piece_statuses" OWNER TO "postgres";
CREATE TYPE "public"."artist_statuses" AS ENUM (
    'pending-approval',
    'approved'
);
ALTER TYPE "public"."artist_statuses" OWNER TO "postgres";
CREATE TYPE "public"."aspect_ratios" AS ENUM (
    '1:1',
    '2:3',
    '3:4'
);
ALTER TYPE "public"."aspect_ratios" OWNER TO "postgres";
CREATE TYPE "public"."order_status" AS ENUM (
    'pending',
    'succeeded'
);
ALTER TYPE "public"."order_status" OWNER TO "postgres";
CREATE TYPE "public"."payment_intent_status" AS ENUM (
    'Blocked',
    'Canceled',
    'Dispute lost',
    'Dispute needs response',
    'Dispute under review',
    'Dispute won',
    'Early fraud warning',
    'Expired',
    'Failed',
    'Incomplete',
    'Inquiry closed',
    'Inquiry needs response',
    'Inquiry under review',
    'Partially refunded',
    'Pending',
    'Refund pending',
    'Refunded',
    'Succeeded',
    'Uncaptured'
);
ALTER TYPE "public"."payment_intent_status" OWNER TO "postgres";
CREATE TYPE "public"."print_options" AS ENUM (
    'canvas',
    'framed-canvas',
    'poster',
    'framed-poster'
);
ALTER TYPE "public"."print_options" OWNER TO "postgres";
CREATE TYPE "public"."product_request_statuses" AS ENUM (
    'pending',
    'fulfilled',
    'cancelled',
    'email-failed'
);
ALTER TYPE "public"."product_request_statuses" OWNER TO "postgres";
CREATE TYPE "public"."product_request_types" AS ENUM (
    'print',
    'original'
);
ALTER TYPE "public"."product_request_types" OWNER TO "postgres";
CREATE TYPE "public"."product_types" AS ENUM (
    'print',
    'original',
    'print-and-original'
);
ALTER TYPE "public"."product_types" OWNER TO "postgres";
COMMENT ON TYPE "public"."product_types" IS 'What type of product is being sold (prints, or original item, or both?)';
CREATE TYPE "public"."quality_ratings" AS ENUM (
    'fair',
    'good',
    'best'
);
ALTER TYPE "public"."quality_ratings" OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."calculate_price"("p_height" numeric, "p_width" numeric, "p_print_type" "public"."print_options") RETURNS numeric
    LANGUAGE "plpgsql"
    AS $_$
DECLARE
  area NUMERIC;
  price_per_sq_inch NUMERIC;
  framing_cost NUMERIC := 50.00; -- Fixed cost for framing
  base_price NUMERIC;
BEGIN
  -- Calculate area in square inches
  area := p_height * p_width;
  
  -- Set price per square inch based on print type
  CASE p_print_type
    WHEN 'canvas' THEN
      price_per_sq_inch := 0.50; -- $0.50 per square inch for canvas
    WHEN 'framed-canvas' THEN
      price_per_sq_inch := 0.50; -- $0.50 per square inch for canvas
    WHEN 'poster' THEN
      price_per_sq_inch := 0.25; -- $0.25 per square inch for poster
    WHEN 'framed-poster' THEN
      price_per_sq_inch := 0.25; -- $0.25 per square inch for poster
    ELSE
      price_per_sq_inch := 0.25; -- Default to poster pricing
  END CASE;
  
  -- Calculate base price from area
  base_price := area * price_per_sq_inch;
  
  -- Add framing cost if applicable
  IF p_print_type IN ('framed-canvas', 'framed-poster') THEN
    base_price := base_price + framing_cost;
  END IF;
  
  -- Round to 2 decimal places and return
  RETURN ROUND(base_price, 2);
END;
$_$;
ALTER FUNCTION "public"."calculate_price"("p_height" numeric, "p_width" numeric, "p_print_type" "public"."print_options") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."delete_art_piece_storage_files"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  -- Delete original (private bucket)
  if OLD.original_path is not null and OLD.original_path <> '' then
    perform storage.delete_object('originals', OLD.original_path);
  end if;

  -- Delete display + thumbnail (public bucket)
  if OLD.display_path is not null and OLD.display_path <> '' then
    perform storage.delete_object('art-pieces', OLD.display_path);
  end if;

  if OLD.thumbnail_path is not null and OLD.thumbnail_path <> '' then
    perform storage.delete_object('art-pieces', OLD.thumbnail_path);
  end if;

  return OLD;
end;
$$;
ALTER FUNCTION "public"."delete_art_piece_storage_files"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."get_dimension_options"("px_width" integer, "px_height" integer, "dpi" integer, "aspect_ratio" "public"."aspect_ratios") RETURNS TABLE("height" numeric, "width" numeric)
    LANGUAGE "plpgsql"
    AS $$DECLARE
  max_width_inches NUMERIC;
  max_height_inches NUMERIC;
  target_aspect_ratio aspect_ratios;
BEGIN
  -- Store parameter in local variable to avoid ambiguity
  target_aspect_ratio := aspect_ratio;
  
  -- Calculate maximum dimensions based on DPI
  max_width_inches := px_width::NUMERIC / dpi;
  max_height_inches := px_height::NUMERIC / dpi;
 
  -- Get all possible dimensions from the print_dimensions table that match the given aspect ratio
  -- Remove all dimensions that exceed the maximum dimensions calculated above
  -- Return the remaining dimensions
  RETURN QUERY
    SELECT d.height, d.width
    FROM print_dimensions d
    WHERE d.aspect_ratio = target_aspect_ratio
      AND d.height <= max_height_inches + 3
      AND d.width <= max_width_inches + 3
    ORDER BY d.height DESC, d.width DESC;
   
  END;$$;
ALTER FUNCTION "public"."get_dimension_options"("px_width" integer, "px_height" integer, "dpi" integer, "aspect_ratio" "public"."aspect_ratios") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."prevent_art_piece_delete_with_open_product_requests"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  -- Check if there are any *open* product requests for this art_piece
  if exists (
    select 1
    from public.product_request pr
    where pr.art_piece_id = old.id
      and pr.status in ('pending')
  ) then
    raise exception
      'Cannot delete art_piece %: there are open product requests.',
      old.id
      using errcode = 'P0001'; -- generic custom error
  end if;

  -- If no open requests, allow the delete
  return old;
end;
$$;
ALTER FUNCTION "public"."prevent_art_piece_delete_with_open_product_requests"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."rpc_search_art_pieces"("query" "text") RETURNS TABLE("title" "text", "thumbnail_path" "text", "display_path" "text", "medium" "text", "art_piece_id" "uuid", "px_height" integer, "px_width" integer, "dpi" integer, "aspect_ratio" "public"."aspect_ratios", "artist_name" "text", "artist_id" "uuid")
    LANGUAGE "sql" STABLE
    AS $$
  SELECT ap.title, ap.thumbnail_path, ap.display_path, ap.medium, ap.id, ap.px_height, ap.px_width, ap.dpi, ap.aspect_ratio,  a.name, a.id
  FROM art_piece ap
  JOIN artist a ON ap.artist_id = a.id
  WHERE to_tsvector('english', coalesce(ap.title, '') || ' ' || coalesce(a.name, ''))
    @@ plainto_tsquery('english', query);
$$;
ALTER FUNCTION "public"."rpc_search_art_pieces"("query" "text") OWNER TO "postgres";
SET default_tablespace = '';
SET default_table_access_method = "heap";
CREATE TABLE IF NOT EXISTS "public"."artist" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "bio" "text",
    "location" "text",
    "profile_img_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "website" "text",
    "instagram" "text",
    "facebook" "text",
    "email_address" "text",
    "user_id" "uuid",
    "status" "public"."artist_statuses" DEFAULT 'pending-approval'::"public"."artist_statuses" NOT NULL
);
ALTER TABLE "public"."artist" OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."rpc_search_artists"("query" "text") RETURNS SETOF "public"."artist"
    LANGUAGE "sql" STABLE
    AS $$
  SELECT * 
  FROM artist a
  WHERE to_tsvector('english', coalesce(a.name, '') || ' ' || coalesce(a.bio, '') || ' ' || coalesce(a.website, '') || ' ' || coalesce(a.facebook, '') || ' ' || coalesce(a.instagram, '') || ' ' || coalesce(a.location, ''))
    @@ plainto_tsquery('english', query);
$$;
ALTER FUNCTION "public"."rpc_search_artists"("query" "text") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."update_cart_item_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."update_cart_item_updated_at"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."address" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "line1" "text" NOT NULL,
    "line2" "text",
    "city" "text" NOT NULL,
    "state" "text",
    "postal_code" "text" NOT NULL,
    "country" "text" NOT NULL,
    "phone" "text"
);
ALTER TABLE "public"."address" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."art_piece" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "medium" "public"."art_mediums" NOT NULL,
    "px_height" integer,
    "px_width" integer,
    "dpi" integer,
    "aspect_ratio" "public"."aspect_ratios" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "artist_id" "uuid",
    "display_path" "text",
    "thumbnail_path" "text",
    "description" "text",
    "product_type" "public"."product_types",
    "status" "public"."art_piece_statuses" DEFAULT 'pending-approval'::"public"."art_piece_statuses",
    "original_path" "text",
    "price" numeric(12,2),
    "price_includes_shipping" boolean,
    "not_ai_generated" boolean DEFAULT false NOT NULL,
    "authorized_to_sell" boolean DEFAULT false NOT NULL,
    "product_dimensions_id" "uuid"
);
ALTER TABLE "public"."art_piece" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."art_piece_display_image" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "art_piece_id" "uuid" NOT NULL,
    "idx" integer NOT NULL,
    "path" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."art_piece_display_image" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."payment_intent" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "stripe_payment_intent_id" "text" NOT NULL,
    "stripe_payment_intent_status" "public"."payment_intent_status" DEFAULT 'Incomplete'::"public"."payment_intent_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);
ALTER TABLE "public"."payment_intent" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."print_dimensions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "height" numeric(8,2) NOT NULL,
    "width" numeric(8,2) NOT NULL,
    "aspect_ratio" "public"."aspect_ratios" NOT NULL
);
ALTER TABLE "public"."print_dimensions" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."product_dimensions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "width_in" numeric(12,2),
    "height_in" numeric(12,2),
    "depth_in" numeric(12,2),
    "art_piece_id" "uuid"
);
ALTER TABLE "public"."product_dimensions" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."product_request" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "public"."product_request_types" NOT NULL,
    "name" "text" NOT NULL,
    "from_email" "text" NOT NULL,
    "message" "text",
    "dimensions" "text",
    "print_option" "public"."print_options",
    "art_piece_id" "uuid" NOT NULL,
    "artist_id" "uuid" NOT NULL,
    "status" "public"."product_request_statuses" DEFAULT 'pending'::"public"."product_request_statuses" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);
ALTER TABLE "public"."product_request" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."purchase_item" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "art_piece_id" "uuid" NOT NULL,
    "purchase_order_id" "uuid",
    "price" numeric(10,2) NOT NULL,
    "height" numeric(8,2) NOT NULL,
    "width" numeric(8,2) NOT NULL,
    "print_option" "public"."print_options" NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "purchase_item_quantity_check" CHECK (("quantity" > 0))
);
ALTER TABLE "public"."purchase_item" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."purchase_order" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "payment_intent_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "status" "public"."order_status" DEFAULT 'pending'::"public"."order_status" NOT NULL,
    "shipping_address_id" "uuid",
    "billing_address_id" "uuid",
    "order_notification_sent_at" timestamp with time zone
);
ALTER TABLE "public"."purchase_order" OWNER TO "postgres";
ALTER TABLE ONLY "public"."address"
    ADD CONSTRAINT "address_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."art_piece_display_image"
    ADD CONSTRAINT "art_piece_display_image_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."art_piece"
    ADD CONSTRAINT "art_piece_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."artist"
    ADD CONSTRAINT "artist_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."artist"
    ADD CONSTRAINT "artist_user_id_key" UNIQUE ("user_id");
ALTER TABLE ONLY "public"."print_dimensions"
    ADD CONSTRAINT "dimensions_height_width_aspect_ratio_key" UNIQUE ("height", "width", "aspect_ratio");
ALTER TABLE ONLY "public"."print_dimensions"
    ADD CONSTRAINT "dimensions_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."payment_intent"
    ADD CONSTRAINT "payment_intent_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."payment_intent"
    ADD CONSTRAINT "payment_intent_stripe_payment_intent_id_key" UNIQUE ("stripe_payment_intent_id");
ALTER TABLE ONLY "public"."product_dimensions"
    ADD CONSTRAINT "product_dimensions_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."product_request"
    ADD CONSTRAINT "product_request_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."purchase_item"
    ADD CONSTRAINT "purchase_item_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."purchase_order"
    ADD CONSTRAINT "purchase_order_pkey" PRIMARY KEY ("id");
CREATE INDEX "art_piece_artist_id_idx" ON "public"."art_piece" USING "btree" ("artist_id");
CREATE INDEX "idx_address_country" ON "public"."address" USING "btree" ("country");
CREATE INDEX "idx_address_user_id" ON "public"."address" USING "btree" ("user_id");
CREATE INDEX "idx_art_piece_display_image_art_piece_id" ON "public"."art_piece_display_image" USING "btree" ("art_piece_id");
CREATE INDEX "idx_payment_intent_user_id" ON "public"."payment_intent" USING "btree" ("user_id");
CREATE INDEX "idx_purchase_item_art_piece_id" ON "public"."purchase_item" USING "btree" ("art_piece_id");
CREATE INDEX "idx_purchase_item_purchase_order_id" ON "public"."purchase_item" USING "btree" ("purchase_order_id");
CREATE INDEX "idx_purchase_item_user_id" ON "public"."purchase_item" USING "btree" ("user_id");
CREATE INDEX "idx_purchase_order_billing_address_id" ON "public"."purchase_order" USING "btree" ("billing_address_id");
CREATE INDEX "idx_purchase_order_payment_intent_id" ON "public"."purchase_order" USING "btree" ("payment_intent_id");
CREATE INDEX "idx_purchase_order_shipping_address_id" ON "public"."purchase_order" USING "btree" ("shipping_address_id");
CREATE INDEX "idx_purchase_order_user_id" ON "public"."purchase_order" USING "btree" ("user_id");
CREATE OR REPLACE TRIGGER "payment_intent_updated_at" BEFORE UPDATE ON "public"."payment_intent" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();
CREATE OR REPLACE TRIGGER "prevent_delete_with_product_requests" BEFORE DELETE ON "public"."art_piece" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_art_piece_delete_with_open_product_requests"();
CREATE OR REPLACE TRIGGER "purchase_item_updated_at" BEFORE UPDATE ON "public"."purchase_item" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();
CREATE OR REPLACE TRIGGER "purchase_order_updated_at" BEFORE UPDATE ON "public"."purchase_order" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();
ALTER TABLE ONLY "public"."address"
    ADD CONSTRAINT "address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."art_piece"
    ADD CONSTRAINT "art_piece_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."artist"("id") ON DELETE RESTRICT;
ALTER TABLE ONLY "public"."art_piece_display_image"
    ADD CONSTRAINT "art_piece_display_image_art_piece_id_fkey" FOREIGN KEY ("art_piece_id") REFERENCES "public"."art_piece"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."art_piece"
    ADD CONSTRAINT "art_piece_product_dimensions_id_fkey" FOREIGN KEY ("product_dimensions_id") REFERENCES "public"."product_dimensions"("id");
ALTER TABLE ONLY "public"."artist"
    ADD CONSTRAINT "artist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");
ALTER TABLE ONLY "public"."payment_intent"
    ADD CONSTRAINT "payment_intent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."product_dimensions"
    ADD CONSTRAINT "product_dimensions_art_piece_id_fkey" FOREIGN KEY ("art_piece_id") REFERENCES "public"."art_piece"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."product_request"
    ADD CONSTRAINT "product_request_art_piece_id_fkey" FOREIGN KEY ("art_piece_id") REFERENCES "public"."art_piece"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."product_request"
    ADD CONSTRAINT "product_request_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."artist"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."purchase_item"
    ADD CONSTRAINT "purchase_item_art_piece_id_fkey" FOREIGN KEY ("art_piece_id") REFERENCES "public"."art_piece"("id") ON DELETE RESTRICT;
ALTER TABLE ONLY "public"."purchase_item"
    ADD CONSTRAINT "purchase_item_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_order"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."purchase_item"
    ADD CONSTRAINT "purchase_item_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."purchase_order"
    ADD CONSTRAINT "purchase_order_billing_address_id_fkey" FOREIGN KEY ("billing_address_id") REFERENCES "public"."address"("id") ON DELETE SET NULL;
ALTER TABLE ONLY "public"."purchase_order"
    ADD CONSTRAINT "purchase_order_payment_intent_id_fkey" FOREIGN KEY ("payment_intent_id") REFERENCES "public"."payment_intent"("id");
ALTER TABLE ONLY "public"."purchase_order"
    ADD CONSTRAINT "purchase_order_shipping_address_id_fkey" FOREIGN KEY ("shipping_address_id") REFERENCES "public"."address"("id") ON DELETE SET NULL;
ALTER TABLE ONLY "public"."purchase_order"
    ADD CONSTRAINT "purchase_order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
CREATE POLICY "Admin can delete art pieces" ON "public"."art_piece" FOR DELETE TO "authenticated" USING (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));
CREATE POLICY "Admin can delete display images" ON "public"."art_piece_display_image" FOR DELETE TO "authenticated" USING (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));
CREATE POLICY "Admin can see all product requests" ON "public"."product_request" FOR SELECT TO "authenticated" USING (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));
CREATE POLICY "Admin can update all display images" ON "public"."art_piece_display_image" FOR UPDATE TO "authenticated" USING (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text")) WITH CHECK (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));
CREATE POLICY "Admin can update all product requests" ON "public"."product_request" FOR UPDATE TO "authenticated" USING (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text")) WITH CHECK (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));
CREATE POLICY "Admin can update art pieces" ON "public"."art_piece" FOR UPDATE TO "authenticated" USING (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text")) WITH CHECK (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));
CREATE POLICY "Admin can update product dimensions" ON "public"."product_dimensions" FOR UPDATE TO "authenticated" USING (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text")) WITH CHECK (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));
CREATE POLICY "Admin sees all art" ON "public"."art_piece" FOR SELECT TO "authenticated" USING (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));
CREATE POLICY "Artist can see their own art pieces (all statuses)" ON "public"."art_piece" FOR SELECT TO "authenticated" USING (("artist_id" IN ( SELECT "artist"."id"
   FROM "public"."artist"
  WHERE ("artist"."user_id" = "auth"."uid"()))));
CREATE POLICY "Artists are viewable by everyone" ON "public"."artist" FOR SELECT USING (true);
CREATE POLICY "Artists can delete their own art pieces" ON "public"."art_piece" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."artist" "a"
  WHERE (("a"."id" = "art_piece"."artist_id") AND ("a"."user_id" = "auth"."uid"())))));
CREATE POLICY "Artists can delete their own display images" ON "public"."art_piece_display_image" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."art_piece" "ap"
     JOIN "public"."artist" "a" ON (("a"."id" = "ap"."artist_id")))
  WHERE (("ap"."id" = "art_piece_display_image"."art_piece_id") AND ("a"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));
CREATE POLICY "Artists can see their own product requests" ON "public"."product_request" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."artist" "a"
  WHERE (("a"."id" = "product_request"."artist_id") AND ("a"."user_id" = "auth"."uid"())))));
CREATE POLICY "Artists can update their own art pieces" ON "public"."art_piece" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."artist" "a"
  WHERE (("a"."id" = "art_piece"."artist_id") AND ("a"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."artist" "a"
  WHERE (("a"."id" = "art_piece"."artist_id") AND ("a"."user_id" = "auth"."uid"())))));
CREATE POLICY "Artists can update their own display images" ON "public"."art_piece_display_image" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."art_piece" "ap"
     JOIN "public"."artist" "a" ON (("a"."id" = "ap"."artist_id")))
  WHERE (("ap"."id" = "art_piece_display_image"."art_piece_id") AND ("a"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."art_piece" "ap"
     JOIN "public"."artist" "a" ON (("a"."id" = "ap"."artist_id")))
  WHERE (("ap"."id" = "art_piece_display_image"."art_piece_id") AND ("a"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));
CREATE POLICY "Artists can update their own product dimensions" ON "public"."product_dimensions" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."art_piece" "ap"
     JOIN "public"."artist" "a" ON (("a"."id" = "ap"."artist_id")))
  WHERE (("ap"."id" = "product_dimensions"."art_piece_id") AND ("a"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."art_piece" "ap"
     JOIN "public"."artist" "a" ON (("a"."id" = "ap"."artist_id")))
  WHERE (("ap"."id" = "product_dimensions"."art_piece_id") AND ("a"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));
CREATE POLICY "Artists can update their own product requests" ON "public"."product_request" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."artist" "a"
  WHERE (("a"."id" = "product_request"."artist_id") AND ("a"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."artist" "a"
  WHERE (("a"."id" = "product_request"."artist_id") AND ("a"."user_id" = "auth"."uid"())))));
CREATE POLICY "Artists can update their own profile" ON "public"."artist" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));
CREATE POLICY "Dimensions are viewable by everyone" ON "public"."print_dimensions" FOR SELECT USING (true);
CREATE POLICY "Public can create product requests" ON "public"."product_request" FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can see approved art" ON "public"."art_piece" FOR SELECT TO "authenticated", "anon" USING (("status" = 'approved'::"public"."art_piece_statuses"));
CREATE POLICY "Public can see display images" ON "public"."art_piece_display_image" FOR SELECT USING (true);
CREATE POLICY "Public can see product dimensions" ON "public"."product_dimensions" FOR SELECT USING (true);
CREATE POLICY "Users can delete own addresses" ON "public"."address" FOR DELETE USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can insert own addresses" ON "public"."address" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can read own addresses" ON "public"."address" FOR SELECT USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can update own addresses" ON "public"."address" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));
ALTER TABLE "public"."address" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."art_piece" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."art_piece_display_image" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."artist" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."print_dimensions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."product_dimensions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."product_request" ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT ALL ON FUNCTION "public"."calculate_price"("p_height" numeric, "p_width" numeric, "p_print_type" "public"."print_options") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_price"("p_height" numeric, "p_width" numeric, "p_print_type" "public"."print_options") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_price"("p_height" numeric, "p_width" numeric, "p_print_type" "public"."print_options") TO "service_role";
GRANT ALL ON FUNCTION "public"."delete_art_piece_storage_files"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_art_piece_storage_files"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_art_piece_storage_files"() TO "service_role";
GRANT ALL ON FUNCTION "public"."get_dimension_options"("px_width" integer, "px_height" integer, "dpi" integer, "aspect_ratio" "public"."aspect_ratios") TO "anon";
GRANT ALL ON FUNCTION "public"."get_dimension_options"("px_width" integer, "px_height" integer, "dpi" integer, "aspect_ratio" "public"."aspect_ratios") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dimension_options"("px_width" integer, "px_height" integer, "dpi" integer, "aspect_ratio" "public"."aspect_ratios") TO "service_role";
GRANT ALL ON FUNCTION "public"."prevent_art_piece_delete_with_open_product_requests"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_art_piece_delete_with_open_product_requests"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_art_piece_delete_with_open_product_requests"() TO "service_role";
GRANT ALL ON FUNCTION "public"."rpc_search_art_pieces"("query" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."rpc_search_art_pieces"("query" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rpc_search_art_pieces"("query" "text") TO "service_role";
GRANT ALL ON TABLE "public"."artist" TO "anon";
GRANT ALL ON TABLE "public"."artist" TO "authenticated";
GRANT ALL ON TABLE "public"."artist" TO "service_role";
GRANT ALL ON FUNCTION "public"."rpc_search_artists"("query" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."rpc_search_artists"("query" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rpc_search_artists"("query" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."update_cart_item_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_cart_item_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_cart_item_updated_at"() TO "service_role";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";
GRANT ALL ON TABLE "public"."address" TO "anon";
GRANT ALL ON TABLE "public"."address" TO "authenticated";
GRANT ALL ON TABLE "public"."address" TO "service_role";
GRANT ALL ON TABLE "public"."art_piece" TO "anon";
GRANT ALL ON TABLE "public"."art_piece" TO "authenticated";
GRANT ALL ON TABLE "public"."art_piece" TO "service_role";
GRANT ALL ON TABLE "public"."art_piece_display_image" TO "anon";
GRANT ALL ON TABLE "public"."art_piece_display_image" TO "authenticated";
GRANT ALL ON TABLE "public"."art_piece_display_image" TO "service_role";
GRANT ALL ON TABLE "public"."payment_intent" TO "anon";
GRANT ALL ON TABLE "public"."payment_intent" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_intent" TO "service_role";
GRANT ALL ON TABLE "public"."print_dimensions" TO "anon";
GRANT ALL ON TABLE "public"."print_dimensions" TO "authenticated";
GRANT ALL ON TABLE "public"."print_dimensions" TO "service_role";
GRANT ALL ON TABLE "public"."product_dimensions" TO "anon";
GRANT ALL ON TABLE "public"."product_dimensions" TO "authenticated";
GRANT ALL ON TABLE "public"."product_dimensions" TO "service_role";
GRANT ALL ON TABLE "public"."product_request" TO "anon";
GRANT ALL ON TABLE "public"."product_request" TO "authenticated";
GRANT ALL ON TABLE "public"."product_request" TO "service_role";
GRANT ALL ON TABLE "public"."purchase_item" TO "anon";
GRANT ALL ON TABLE "public"."purchase_item" TO "authenticated";
GRANT ALL ON TABLE "public"."purchase_item" TO "service_role";
GRANT ALL ON TABLE "public"."purchase_order" TO "anon";
GRANT ALL ON TABLE "public"."purchase_order" TO "authenticated";
GRANT ALL ON TABLE "public"."purchase_order" TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
drop extension if exists "pg_net";
drop policy "Public can see approved art" on "public"."art_piece";
create policy "Public can see approved art"
  on "public"."art_piece"
  as permissive
  for select
  to anon, authenticated
using ((status = 'approved'::public.art_piece_statuses));
create policy "Admin can delete all art-pieces objects 1fksyjz_0"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'art-pieces'::text) AND (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)));
create policy "Admin can delete all art-pieces objects 1fksyjz_1"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'art-pieces'::text) AND (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)));
create policy "Admin can delete all originals objects 1vqg1c2_0"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'originals'::text) AND (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)));
create policy "Admin can delete all originals objects 1vqg1c2_1"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'originals'::text) AND (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)));
create policy "Artists can delete their own art-pieces objects 1fksyjz_0"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'art-pieces'::text) AND (EXISTS ( SELECT 1
   FROM public.artist a
  WHERE ((a.user_id = auth.uid()) AND ((objects.name ~~ (('display/'::text || a.id) || '/%'::text)) OR (objects.name ~~ (('thumbnails/'::text || a.id) || '/%'::text))))))));
create policy "Artists can delete their own art-pieces objects 1fksyjz_1"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'art-pieces'::text) AND (EXISTS ( SELECT 1
   FROM public.artist a
  WHERE ((a.user_id = auth.uid()) AND ((objects.name ~~ (('display/'::text || a.id) || '/%'::text)) OR (objects.name ~~ (('thumbnails/'::text || a.id) || '/%'::text))))))));
create policy "Artists can delete their own originals objects 1vqg1c2_0"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'originals'::text) AND (EXISTS ( SELECT 1
   FROM public.artist a
  WHERE ((a.user_id = auth.uid()) AND (objects.name ~~ (a.id || '/%'::text)))))));
create policy "Artists can delete their own originals objects 1vqg1c2_1"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'originals'::text) AND (EXISTS ( SELECT 1
   FROM public.artist a
  WHERE ((a.user_id = auth.uid()) AND (objects.name ~~ (a.id || '/%'::text)))))));
create policy "Public read on art pieces 1fksyjz_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'art-pieces'::text));