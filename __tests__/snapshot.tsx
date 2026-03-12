import { renderWithProviders } from './test-utils'
import Home from '../app/page'
 
it('renders homepage unchanged', () => {
  const { container } = renderWithProviders(<Home />)
  expect(container).toMatchSnapshot()
})