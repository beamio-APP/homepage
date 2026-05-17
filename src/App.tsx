//		APP.tsx

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"
import BeamioProtocolPage from './pages/BeamioProtocolPage'
import TermsPage from './TermsPage'
import PrivacyPage from './PrivacyPage'

const App: React.FC = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<BeamioProtocolPage />} />
				<Route path="/home" element={<BeamioProtocolPage />} />
				<Route path="/terms" element={<TermsPage />} />
				<Route path="/privacy" element={<PrivacyPage />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App