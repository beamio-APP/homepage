//		APP.tsx

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"
import BeamioProtocolPage from './pages/BeamioProtocolPage'
import HomeExample from './pages/homeExample'
import TermsPage from './TermsPage'
import PrivacyPage from './PrivacyPage'
import ContactPage from './pages/ContactPage'
import AppDownloadPage from './pages/AppDownloadPage'

const App: React.FC = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<BeamioProtocolPage />} />
				<Route path="/home" element={<BeamioProtocolPage />} />
				<Route path="/homeExample" element={<HomeExample />} />
				<Route path="/app-download" element={<AppDownloadPage />} />
				<Route path="/contact" element={<ContactPage />} />
				<Route path="/terms" element={<TermsPage />} />
				<Route path="/privacy" element={<PrivacyPage />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App