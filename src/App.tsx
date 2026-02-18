//		APP.tsx

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"
import TermsPage from './TermsPage'
import PrivacyPage from './PrivacyPage'

/** "/" 根路径：使用 newHome.html 完整内容（静态页面） */
const NewHomePage: React.FC = () => (
	<iframe
		src="/newHome.html"
		className="w-full min-h-screen border-0 block"
		style={{ minHeight: '100vh' }}
		title="Beamio | The Visa for the AI Economy"
	/>
);

const App: React.FC = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<NewHomePage />} />
				<Route path="/terms" element={<TermsPage />} />
				<Route path="/privacy" element={<PrivacyPage />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App