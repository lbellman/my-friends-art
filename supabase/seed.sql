
INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '211e3fcc-bd0b-4039-895f-5c076b17bb3b', 'authenticated', 'authenticated', 'bellmanlindsey+1@gmail.com', '$2a$10$NywjwTFimylYA7O6L1SEOeEPavf120G5RaB6p/v8DZSf6Y4Oz4sri', '2026-03-18 19:32:48.262857+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-03-20 23:43:39.11198+00', '{"provider": "email", "providers": ["email"]}', '{"full_name": "Yuki Tanaka", "email_verified": true}', NULL, '2026-03-18 19:32:48.260308+00', '2026-03-20 23:43:45.364625+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'fd633bb9-0569-4e86-b04f-87d4879dffb6', 'authenticated', 'authenticated', 'bellmanlindsey+2@gmail.com', '$2a$10$NywjwTFimylYA7O6L1SEOeEPavf120G5RaB6p/v8DZSf6Y4Oz4sri', '2026-03-16 20:40:47.036936+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-03-25 01:19:26.576016+00', '{"provider": "email", "providers": ["email"]}', '{"full_name": "Marcus Okonkwo", "email_verified": true}', NULL, '2026-03-16 20:40:47.008218+00', '2026-03-26 16:01:10.134787+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', 'authenticated', 'authenticated', 'bellmanlindsey@gmail.com', '$2a$10$NywjwTFimylYA7O6L1SEOeEPavf120G5RaB6p/v8DZSf6Y4Oz4sri', '2026-01-08 22:43:08.860058+00', NULL, '', NULL, '', '2026-03-25 18:17:37.964945+00', '', '', NULL, '2026-03-25 18:18:12.13539+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "77d74062-1aa9-4ff8-ad85-d23c3bf520e7", "role": "admin", "email": "bellmanlindsey@gmail.com", "full_name": "Elena Vasquez", "last_name": "Vasquez", "first_name": "Elena", "email_verified": true, "phone_verified": false}', NULL, '2026-01-08 22:42:58.829737+00', '2026-03-26 17:40:26.529919+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('77d74062-1aa9-4ff8-ad85-d23c3bf520e7', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', '{"sub": "77d74062-1aa9-4ff8-ad85-d23c3bf520e7", "email": "bellmanlindsey@gmail.com", "last_name": "Bellman", "first_name": "Lindsey", "email_verified": true, "phone_verified": false}', 'email', '2026-01-08 22:42:58.834172+00', '2026-01-08 22:42:58.834219+00', '2026-01-08 22:42:58.834219+00', 'ff5a0434-e358-4f74-b6c5-91109f5e8dd9'),
	('fd633bb9-0569-4e86-b04f-87d4879dffb6', 'fd633bb9-0569-4e86-b04f-87d4879dffb6', '{"sub": "fd633bb9-0569-4e86-b04f-87d4879dffb6", "email": "bellmanlindsey+2@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-03-16 20:40:47.028815+00', '2026-03-16 20:40:47.028874+00', '2026-03-16 20:40:47.028874+00', '09ee56f6-c550-4ea2-8620-bbdcf2a284bd'),
	('211e3fcc-bd0b-4039-895f-5c076b17bb3b', '211e3fcc-bd0b-4039-895f-5c076b17bb3b', '{"sub": "211e3fcc-bd0b-4039-895f-5c076b17bb3b", "email": "bellmanlindsey+1@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-03-18 19:32:48.261374+00', '2026-03-18 19:32:48.261421+00', '2026-03-18 19:32:48.261421+00', '9d2ad029-37cc-4da5-9696-2874bfe05695');
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('574cb4d3-6da6-48be-abba-9f10fc20b38f', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', '2026-03-23 19:53:43.046376+00', '2026-03-23 19:53:43.046376+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '162.156.53.184', NULL, NULL, NULL, NULL, NULL),
	('29a58b15-0655-4969-bee5-b64bab07b4f2', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', '2026-03-25 18:18:12.135555+00', '2026-03-25 19:18:33.779905+00', NULL, 'aal1', NULL, '2026-03-25 19:18:33.779795', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '162.156.53.184', NULL, NULL, NULL, NULL, NULL),
	('be5354f3-5fbf-4390-a49f-b804446800cb', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', '2026-03-23 18:59:04.848669+00', '2026-03-25 22:52:43.611861+00', NULL, 'aal1', NULL, '2026-03-25 22:52:43.61173', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '162.156.53.184', NULL, NULL, NULL, NULL, NULL),
	('b0d1eca8-6d8c-4165-b5a5-3ee78cd30200', 'fd633bb9-0569-4e86-b04f-87d4879dffb6', '2026-03-23 18:47:28.533455+00', '2026-03-26 16:01:10.147131+00', NULL, 'aal1', NULL, '2026-03-26 16:01:10.146999', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1', '66.183.174.58', NULL, NULL, NULL, NULL, NULL),
	('e11f37e9-f15b-4ded-9e6a-59012dd55f8d', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', '2026-03-20 23:48:25.838312+00', '2026-03-26 17:40:26.54811+00', NULL, 'aal1', NULL, '2026-03-26 17:40:26.548', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '162.156.53.184', NULL, NULL, NULL, NULL, NULL),
	('7be3a857-cefc-4ada-96e2-98ac09f9faab', 'fd633bb9-0569-4e86-b04f-87d4879dffb6', '2026-03-25 01:19:26.57612+00', '2026-03-25 01:19:26.57612+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '70.66.190.2', NULL, NULL, NULL, NULL, NULL),
	('d6f52a59-0a61-42a8-9172-6b9f1bf3c618', '211e3fcc-bd0b-4039-895f-5c076b17bb3b', '2026-03-20 23:43:39.112076+00', '2026-03-20 23:43:39.112076+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '184.66.238.60', NULL, NULL, NULL, NULL, NULL);

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('d6f52a59-0a61-42a8-9172-6b9f1bf3c618', '2026-03-20 23:43:39.143922+00', '2026-03-20 23:43:39.143922+00', 'otp', 'ca12e5ce-fc95-469b-8702-89ddb8ec534b'),
	('e11f37e9-f15b-4ded-9e6a-59012dd55f8d', '2026-03-20 23:48:25.843179+00', '2026-03-20 23:48:25.843179+00', 'password', 'd6eba3a2-4441-4377-91c1-2b3fad58a331'),
	('b0d1eca8-6d8c-4165-b5a5-3ee78cd30200', '2026-03-23 18:47:28.536238+00', '2026-03-23 18:47:28.536238+00', 'password', 'ed6d8ab3-40c9-4767-8dd4-d322b0854fff'),
	('be5354f3-5fbf-4390-a49f-b804446800cb', '2026-03-23 18:59:04.889283+00', '2026-03-23 18:59:04.889283+00', 'password', '2a32966c-3a13-4f29-8fc0-17b92376e27d'),
	('574cb4d3-6da6-48be-abba-9f10fc20b38f', '2026-03-23 19:53:43.13334+00', '2026-03-23 19:53:43.13334+00', 'password', 'b9615bf6-65b8-418a-85e5-9fd5bc000dcb'),
	('7be3a857-cefc-4ada-96e2-98ac09f9faab', '2026-03-25 01:19:26.653224+00', '2026-03-25 01:19:26.653224+00', 'password', '0307aa4f-2fe6-44ff-af4e-d02596c1c34a'),
	('29a58b15-0655-4969-bee5-b64bab07b4f2', '2026-03-25 18:18:12.159774+00', '2026-03-25 18:18:12.159774+00', 'otp', '90b5b874-9f6d-4625-b7e6-8f3cd92cb785');


INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 166, 'mw5dgis6lma4', 'fd633bb9-0569-4e86-b04f-87d4879dffb6', true, '2026-03-23 20:12:24.967673+00', '2026-03-23 21:26:17.450912+00', 'sfq5564i4unf', 'b0d1eca8-6d8c-4165-b5a5-3ee78cd30200'),
	('00000000-0000-0000-0000-000000000000', 169, '626p3efsn6ch', 'fd633bb9-0569-4e86-b04f-87d4879dffb6', true, '2026-03-23 21:26:17.459551+00', '2026-03-23 22:37:56.156242+00', 'mw5dgis6lma4', 'b0d1eca8-6d8c-4165-b5a5-3ee78cd30200'),
	('00000000-0000-0000-0000-000000000000', 170, 'zig55ewpa62f', 'fd633bb9-0569-4e86-b04f-87d4879dffb6', true, '2026-03-23 22:37:56.192078+00', '2026-03-24 04:31:02.792424+00', '626p3efsn6ch', 'b0d1eca8-6d8c-4165-b5a5-3ee78cd30200'),
	('00000000-0000-0000-0000-000000000000', 171, 'dhkcynwmemem', 'fd633bb9-0569-4e86-b04f-87d4879dffb6', true, '2026-03-24 04:31:02.812078+00', '2026-03-24 05:59:03.346199+00', 'zig55ewpa62f', 'b0d1eca8-6d8c-4165-b5a5-3ee78cd30200'),
	('00000000-0000-0000-0000-000000000000', 167, '4rrwjfbahtay', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-23 21:01:11.132094+00', '2026-03-24 17:40:53.863266+00', 'i2sozjl7sqb6', 'e11f37e9-f15b-4ded-9e6a-59012dd55f8d'),
	('00000000-0000-0000-0000-000000000000', 173, 'nsbatehr5lpj', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-24 17:40:53.880304+00', '2026-03-24 18:44:30.262631+00', '4rrwjfbahtay', 'e11f37e9-f15b-4ded-9e6a-59012dd55f8d'),
	('00000000-0000-0000-0000-000000000000', 172, '224s2pyeewy7', 'fd633bb9-0569-4e86-b04f-87d4879dffb6', true, '2026-03-24 05:59:03.360183+00', '2026-03-24 19:32:53.943718+00', 'dhkcynwmemem', 'b0d1eca8-6d8c-4165-b5a5-3ee78cd30200'),
	('00000000-0000-0000-0000-000000000000', 174, 'zfwq2vnpqefn', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-24 18:44:30.288847+00', '2026-03-24 19:42:40.744943+00', 'nsbatehr5lpj', 'e11f37e9-f15b-4ded-9e6a-59012dd55f8d'),
	('00000000-0000-0000-0000-000000000000', 176, 'sw7xg2bf4fie', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-24 19:42:40.769564+00', '2026-03-24 20:41:35.252549+00', 'zfwq2vnpqefn', 'e11f37e9-f15b-4ded-9e6a-59012dd55f8d'),
	('00000000-0000-0000-0000-000000000000', 175, '567njssbuq7i', 'fd633bb9-0569-4e86-b04f-87d4879dffb6', true, '2026-03-24 19:32:53.971491+00', '2026-03-24 21:27:32.173396+00', '224s2pyeewy7', 'b0d1eca8-6d8c-4165-b5a5-3ee78cd30200'),
	('00000000-0000-0000-0000-000000000000', 178, 'nkgv6m6utvz3', 'fd633bb9-0569-4e86-b04f-87d4879dffb6', true, '2026-03-24 21:27:32.186265+00', '2026-03-24 23:14:53.78682+00', '567njssbuq7i', 'b0d1eca8-6d8c-4165-b5a5-3ee78cd30200'),
	('00000000-0000-0000-0000-000000000000', 180, 'bryrppdqr5zh', 'fd633bb9-0569-4e86-b04f-87d4879dffb6', false, '2026-03-25 01:19:26.609882+00', '2026-03-25 01:19:26.609882+00', NULL, '7be3a857-cefc-4ada-96e2-98ac09f9faab'),
	('00000000-0000-0000-0000-000000000000', 179, '52ce24jc2i63', 'fd633bb9-0569-4e86-b04f-87d4879dffb6', true, '2026-03-24 23:14:53.818363+00', '2026-03-25 01:24:36.698997+00', 'nkgv6m6utvz3', 'b0d1eca8-6d8c-4165-b5a5-3ee78cd30200'),
	('00000000-0000-0000-0000-000000000000', 181, 'blzcownnnvq5', 'fd633bb9-0569-4e86-b04f-87d4879dffb6', true, '2026-03-25 01:24:36.715504+00', '2026-03-25 02:51:17.131678+00', '52ce24jc2i63', 'b0d1eca8-6d8c-4165-b5a5-3ee78cd30200'),
	('00000000-0000-0000-0000-000000000000', 182, '3a553g3vk5fo', 'fd633bb9-0569-4e86-b04f-87d4879dffb6', true, '2026-03-25 02:51:17.152616+00', '2026-03-25 04:53:40.554283+00', 'blzcownnnvq5', 'b0d1eca8-6d8c-4165-b5a5-3ee78cd30200'),
	('00000000-0000-0000-0000-000000000000', 183, 'xdo7cvtd7yyc', 'fd633bb9-0569-4e86-b04f-87d4879dffb6', true, '2026-03-25 04:53:40.567864+00', '2026-03-25 14:30:24.881386+00', '3a553g3vk5fo', 'b0d1eca8-6d8c-4165-b5a5-3ee78cd30200'),
	('00000000-0000-0000-0000-000000000000', 144, 'wdamhhbfep7q', '211e3fcc-bd0b-4039-895f-5c076b17bb3b', false, '2026-03-20 23:43:39.124585+00', '2026-03-20 23:43:39.124585+00', NULL, 'd6f52a59-0a61-42a8-9172-6b9f1bf3c618'),
	('00000000-0000-0000-0000-000000000000', 184, 'tkbfx4cqrx2r', 'fd633bb9-0569-4e86-b04f-87d4879dffb6', true, '2026-03-25 14:30:24.907806+00', '2026-03-25 17:38:48.965007+00', 'xdo7cvtd7yyc', 'b0d1eca8-6d8c-4165-b5a5-3ee78cd30200'),
	('00000000-0000-0000-0000-000000000000', 177, 'nkbh3coj62tb', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-24 20:41:35.281701+00', '2026-03-25 17:47:05.340194+00', 'sw7xg2bf4fie', 'e11f37e9-f15b-4ded-9e6a-59012dd55f8d'),
	('00000000-0000-0000-0000-000000000000', 147, 't66cruyku23u', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-20 23:48:25.841163+00', '2026-03-21 17:04:56.993406+00', NULL, 'e11f37e9-f15b-4ded-9e6a-59012dd55f8d'),
	('00000000-0000-0000-0000-000000000000', 149, 'ko2ldk6dbwpg', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-21 17:04:57.028212+00', '2026-03-21 19:47:13.146819+00', 't66cruyku23u', 'e11f37e9-f15b-4ded-9e6a-59012dd55f8d'),
	('00000000-0000-0000-0000-000000000000', 150, 'xy6mxypqoxs6', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-21 19:47:13.176181+00', '2026-03-21 22:49:03.976162+00', 'ko2ldk6dbwpg', 'e11f37e9-f15b-4ded-9e6a-59012dd55f8d'),
	('00000000-0000-0000-0000-000000000000', 168, 'qhysdu7qaphv', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-23 21:18:11.448996+00', '2026-03-25 18:28:49.303904+00', 'ccs7xnjs6ntw', 'be5354f3-5fbf-4390-a49f-b804446800cb'),
	('00000000-0000-0000-0000-000000000000', 151, '4nzcyiwuw5fi', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-21 22:49:03.999229+00', '2026-03-22 17:50:45.011464+00', 'xy6mxypqoxs6', 'e11f37e9-f15b-4ded-9e6a-59012dd55f8d'),
	('00000000-0000-0000-0000-000000000000', 152, 'a2upoxyc5uyq', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-22 17:50:45.048905+00', '2026-03-22 18:49:01.339364+00', '4nzcyiwuw5fi', 'e11f37e9-f15b-4ded-9e6a-59012dd55f8d'),
	('00000000-0000-0000-0000-000000000000', 186, '3a53cnigdesr', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-25 17:47:05.356101+00', '2026-03-25 18:46:57.365838+00', 'nkbh3coj62tb', 'e11f37e9-f15b-4ded-9e6a-59012dd55f8d'),
	('00000000-0000-0000-0000-000000000000', 153, 'sgo3tshe7die', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-22 18:49:01.361133+00', '2026-03-22 19:47:03.631002+00', 'a2upoxyc5uyq', 'e11f37e9-f15b-4ded-9e6a-59012dd55f8d'),
	('00000000-0000-0000-0000-000000000000', 154, 'gntjxalihvoy', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-22 19:47:03.64999+00', '2026-03-22 20:45:05.760974+00', 'sgo3tshe7die', 'e11f37e9-f15b-4ded-9e6a-59012dd55f8d'),
	('00000000-0000-0000-0000-000000000000', 187, '4xycwpxwjo7x', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-25 18:18:12.143691+00', '2026-03-25 19:18:33.735822+00', NULL, '29a58b15-0655-4969-bee5-b64bab07b4f2'),
	('00000000-0000-0000-0000-000000000000', 155, 'f5n2hqysql2p', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-22 20:45:05.795593+00', '2026-03-22 21:43:28.954023+00', 'gntjxalihvoy', 'e11f37e9-f15b-4ded-9e6a-59012dd55f8d'),
	('00000000-0000-0000-0000-000000000000', 190, 'wf2v6lnjov34', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', false, '2026-03-25 19:18:33.757417+00', '2026-03-25 19:18:33.757417+00', '4xycwpxwjo7x', '29a58b15-0655-4969-bee5-b64bab07b4f2'),
	('00000000-0000-0000-0000-000000000000', 189, 'jhxeuazcxtm4', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-25 18:46:57.383014+00', '2026-03-25 19:45:17.570504+00', '3a53cnigdesr', 'e11f37e9-f15b-4ded-9e6a-59012dd55f8d'),
	('00000000-0000-0000-0000-000000000000', 156, 'xkphcrjwfnbj', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-22 21:43:28.979359+00', '2026-03-23 01:58:22.593896+00', 'f5n2hqysql2p', 'e11f37e9-f15b-4ded-9e6a-59012dd55f8d'),
	('00000000-0000-0000-0000-000000000000', 157, 'chcyk3m7m3jn', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-23 01:58:22.62728+00', '2026-03-23 02:56:50.517352+00', 'xkphcrjwfnbj', 'e11f37e9-f15b-4ded-9e6a-59012dd55f8d'),
	('00000000-0000-0000-0000-000000000000', 191, 'o6l4zub7gfsx', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-25 19:45:17.595513+00', '2026-03-25 21:05:08.682299+00', 'jhxeuazcxtm4', 'e11f37e9-f15b-4ded-9e6a-59012dd55f8d'),
	('00000000-0000-0000-0000-000000000000', 192, 'r7sjrwhgasb6', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-25 21:05:08.70854+00', '2026-03-25 22:03:14.437966+00', 'o6l4zub7gfsx', 'e11f37e9-f15b-4ded-9e6a-59012dd55f8d'),
	('00000000-0000-0000-0000-000000000000', 158, 'cnsezdk6ro7n', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-23 02:56:50.541691+00', '2026-03-23 18:59:47.202819+00', 'chcyk3m7m3jn', 'e11f37e9-f15b-4ded-9e6a-59012dd55f8d'),
	('00000000-0000-0000-0000-000000000000', 188, 'ex2q7qel6orp', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-25 18:28:49.318781+00', '2026-03-25 22:52:43.557343+00', 'qhysdu7qaphv', 'be5354f3-5fbf-4390-a49f-b804446800cb'),
	('00000000-0000-0000-0000-000000000000', 163, 'etfd57lli5nw', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', false, '2026-03-23 19:53:43.089178+00', '2026-03-23 19:53:43.089178+00', NULL, '574cb4d3-6da6-48be-abba-9f10fc20b38f'),
	('00000000-0000-0000-0000-000000000000', 162, 'gqic3f6g7255', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-23 18:59:47.206642+00', '2026-03-23 19:57:53.63208+00', 'cnsezdk6ro7n', 'e11f37e9-f15b-4ded-9e6a-59012dd55f8d'),
	('00000000-0000-0000-0000-000000000000', 194, 'czarjeyicqiu', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', false, '2026-03-25 22:52:43.57991+00', '2026-03-25 22:52:43.57991+00', 'ex2q7qel6orp', 'be5354f3-5fbf-4390-a49f-b804446800cb'),
	('00000000-0000-0000-0000-000000000000', 161, 'b6nuxx2u7lur', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-23 18:59:04.866257+00', '2026-03-23 20:01:05.784601+00', NULL, 'be5354f3-5fbf-4390-a49f-b804446800cb'),
	('00000000-0000-0000-0000-000000000000', 185, 'xccngcs3ielj', 'fd633bb9-0569-4e86-b04f-87d4879dffb6', true, '2026-03-25 17:38:48.989456+00', '2026-03-26 01:13:14.550154+00', 'tkbfx4cqrx2r', 'b0d1eca8-6d8c-4165-b5a5-3ee78cd30200'),
	('00000000-0000-0000-0000-000000000000', 160, 'sfq5564i4unf', 'fd633bb9-0569-4e86-b04f-87d4879dffb6', true, '2026-03-23 18:47:28.534835+00', '2026-03-23 20:12:24.95166+00', NULL, 'b0d1eca8-6d8c-4165-b5a5-3ee78cd30200'),
	('00000000-0000-0000-0000-000000000000', 164, 'i2sozjl7sqb6', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-23 19:57:53.639397+00', '2026-03-23 21:01:11.099584+00', 'gqic3f6g7255', 'e11f37e9-f15b-4ded-9e6a-59012dd55f8d'),
	('00000000-0000-0000-0000-000000000000', 165, 'ccs7xnjs6ntw', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-23 20:01:05.79097+00', '2026-03-23 21:18:11.440131+00', 'b6nuxx2u7lur', 'be5354f3-5fbf-4390-a49f-b804446800cb'),
	('00000000-0000-0000-0000-000000000000', 195, 'sj2bsvzlkto5', 'fd633bb9-0569-4e86-b04f-87d4879dffb6', true, '2026-03-26 01:13:14.588506+00', '2026-03-26 02:35:06.427023+00', 'xccngcs3ielj', 'b0d1eca8-6d8c-4165-b5a5-3ee78cd30200'),
	('00000000-0000-0000-0000-000000000000', 196, 'odkllgnd5uo6', 'fd633bb9-0569-4e86-b04f-87d4879dffb6', true, '2026-03-26 02:35:06.447175+00', '2026-03-26 14:47:31.440037+00', 'sj2bsvzlkto5', 'b0d1eca8-6d8c-4165-b5a5-3ee78cd30200'),
	('00000000-0000-0000-0000-000000000000', 197, 'fqudtufaecqf', 'fd633bb9-0569-4e86-b04f-87d4879dffb6', true, '2026-03-26 14:47:31.470952+00', '2026-03-26 16:01:10.104734+00', 'odkllgnd5uo6', 'b0d1eca8-6d8c-4165-b5a5-3ee78cd30200'),
	('00000000-0000-0000-0000-000000000000', 198, '5thfmi43ks62', 'fd633bb9-0569-4e86-b04f-87d4879dffb6', false, '2026-03-26 16:01:10.123839+00', '2026-03-26 16:01:10.123839+00', 'fqudtufaecqf', 'b0d1eca8-6d8c-4165-b5a5-3ee78cd30200'),
	('00000000-0000-0000-0000-000000000000', 193, 'odvd5af6bota', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', true, '2026-03-25 22:03:14.470827+00', '2026-03-26 17:40:26.496318+00', 'r7sjrwhgasb6', 'e11f37e9-f15b-4ded-9e6a-59012dd55f8d'),
	('00000000-0000-0000-0000-000000000000', 199, 'cyjee6d4yjcy', '77d74062-1aa9-4ff8-ad85-d23c3bf520e7', false, '2026-03-26 17:40:26.514714+00', '2026-03-26 17:40:26.514714+00', 'odvd5af6bota', 'e11f37e9-f15b-4ded-9e6a-59012dd55f8d');

-- Local seed: 3 artists, 13 art pieces (5 + 4 + 4). Paths left NULL; run `pnpm seed:local-assets` after reset.
-- IDs must match scripts/seed-ids.ts

-- Storage buckets (same names as production; required for `pnpm seed:local-assets` uploads)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('art-pieces', 'art-pieces', true),
  ('originals', 'originals', false),
  ('art-piece-staging', 'art-piece-staging', false),
  ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.artist (
  id,
  user_id,
  name,
  bio,
  location,
  website,
  instagram,
  email_address,
  status,
  profile_img_url
) VALUES
  (
    '10000000-0000-4000-8000-000000000001',
    '77d74062-1aa9-4ff8-ad85-d23c3bf520e7',
    'Elena Vasquez',
    'Crafter and creative visionary. I love working in crochet, knit, and needle felt. Based in Vancouver.',
    'Vancouver, BC',
    'https://elenavasquez.example.com',
    '@elenav.studio',
    'bellmanlindsey@gmail.com',
    'approved',
    'profiles/10000000-0000-4000-8000-000000000001/profile.webp'
   ),
  (
    '20000000-0000-4000-8000-000000000002',
    'fd633bb9-0569-4e86-b04f-87d4879dffb6',
    'Marcus Okonkwo',
    'Mixed-media artist combining textiles and collage. I work with any and all materials. Toronto-based.',
    'Toronto, ON',
    NULL,
    '@marcus.okonkwo.art',
    'bellmanlindsey+2@gmail.com',
    'approved',
    'profiles/20000000-0000-4000-8000-000000000002/profile.webp'
   ),
  (
    '30000000-0000-4000-8000-000000000003',
    '211e3fcc-bd0b-4039-895f-5c076b17bb3b',
    'Yuki Tanaka',
    'Digital and ink works inspired by seasonal change and quiet architecture. Exhibited across Quebec and online.',
    'Montreal, QC',
    'https://yukitanaka.example.com',
    '@yuki.tanaka.studio',
    'bellmanlindsey+1@gmail.com',
    'approved',
    'profiles/30000000-0000-4000-8000-000000000003/profile.webp'
   );

-- Admin RLS uses public.user_roles (see migration user_roles_rls_and_auth_subqueries)
INSERT INTO public.user_roles (user_id, role)
VALUES ('77d74062-1aa9-4ff8-ad85-d23c3bf520e7', 'admin')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.art_piece (
  id,
  title,
  artist_id,
  status,
  px_width,
  px_height,
  description,
  not_ai_generated,
  authorized_to_sell,
  product_type,
  category,
  size,
  display_path,
  thumbnail_path,
  original_path
) VALUES
  -- Artist 1 (Elena) — fiber / wearables
  ('10100000-0000-4000-8000-000000000001', 'Crochet Tote Bags', '10000000-0000-4000-8000-000000000001', 'approved', 2400, 3200, 'Stylish and useful tote bags.', true, true, 'made-to-order', 'textiles-and-fiber', 'one-size', NULL, NULL, NULL),
  ('10100000-0000-4000-8000-000000000002', 'Needle Felt Designs', '10000000-0000-4000-8000-000000000001', 'approved', 2400, 3600, 'Adorable and fluffly needle felted designs.', true, true, 'made-to-order', 'textiles-and-fiber', 'one-size', NULL, NULL, NULL),
  ('10100000-0000-4000-8000-000000000003', 'Knitted Washcloths', '10000000-0000-4000-8000-000000000001', 'approved', 2400, 2400, 'Multi-purpose knitted washcloths.', true, true, 'made-to-order', 'textiles-and-fiber', 'one-size', NULL, NULL, NULL),
  ('10100000-0000-4000-8000-000000000004', 'Knit Slippers', '10000000-0000-4000-8000-000000000001', 'approved', 2400, 3200, 'Cosy knitted slippers.', true, true, 'made-to-order', 'textiles-and-fiber', 'one-size', NULL, NULL, NULL),
  ('10100000-0000-4000-8000-000000000005', 'Crochet Hats', '10000000-0000-4000-8000-000000000001', 'approved', 2400, 3600, 'Cosy winter hats.', true, true, 'made-to-order', 'textiles-and-fiber', 'one-size', NULL, NULL, NULL),
  -- Artist 2 (Marcus)
  ('10200000-0000-4000-8000-000000000001', 'Market Square Rhythm', '20000000-0000-4000-8000-000000000002', 'approved', 2400, 3200, 'Collage of urban movement.', true, true, 'original', 'wall-art', 'one-size', NULL, NULL, NULL),
  ('10200000-0000-4000-8000-000000000002', 'Patina Doorways', '20000000-0000-4000-8000-000000000002', 'approved', 2400, 3600, 'Texture and aged metal.', true, true, 'original', 'wall-art', 'one-size', NULL, NULL, NULL),
  ('10200000-0000-4000-8000-000000000003', 'Echo Chamber', '20000000-0000-4000-8000-000000000002', 'approved', 2400, 2400, 'Geometric abstraction.', true, true, 'original', 'wall-art', 'one-size', NULL, NULL, NULL),
  ('10200000-0000-4000-8000-000000000004', 'Clay Meditation', '20000000-0000-4000-8000-000000000002', 'approved', 2400, 3200, 'Earthy palette study.', true, true, 'original', 'wall-art', 'one-size', NULL, NULL, NULL),
  -- Artist 3 (Yuki)
  ('10300000-0000-4000-8000-000000000001', 'Snow Line', '30000000-0000-4000-8000-000000000003', 'approved', 2400, 3600, 'Minimal winter landscape.', true, true, 'print', 'wall-art', 'one-size', NULL, NULL, NULL),
  ('10300000-0000-4000-8000-000000000002', 'Tea House Interior', '30000000-0000-4000-8000-000000000003', 'approved', 2400, 3200, 'Quiet interior light.', true, true, 'print', 'wall-art', 'one-size', NULL, NULL, NULL),
  ('10300000-0000-4000-8000-000000000003', 'Bamboo Shadow', '30000000-0000-4000-8000-000000000003', 'approved', 2400, 2400, 'Ink wash on paper.', true, true, 'print', 'wall-art', 'one-size', NULL, NULL, NULL),
  ('10300000-0000-4000-8000-000000000004', 'Ink River', '30000000-0000-4000-8000-000000000003', 'approved', 2400, 3200, 'Flowing dark lines.', true, true, 'print', 'wall-art', 'one-size', NULL, NULL, NULL);
