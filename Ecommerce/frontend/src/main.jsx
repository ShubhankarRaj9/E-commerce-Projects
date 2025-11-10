import { createRoot } from 'react-dom/client'
import {Provider} from 'react-redux'
import './index.css'
import {store} from './store/store.js'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(<Provider store={store}> <ThemeProvider> <App /></ThemeProvider> </Provider>);
