import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import MyDocuments from './pages/MyDocuments';
import ComplianceCenter from './pages/ComplianceCenter';
import SettingsPage from './pages/SettingsPage';
import TemplatesPage from './pages/TemplatesPage';
import DocumentTemplateEditor from './pages/DocumentTemplateEditor';
import CreateDocument from './pages/CreateDocument';
import BrandSettings from './pages/BrandSettings';
import DocumentRecipients from './pages/DocumentRecipients';
import DocumentEditor from './pages/DocumentEditor';
import SignatureTest from './pages/SignatureTest';
import GSTFilingSummaryPage from './pages/GSTFilingSummaryPage';
import './styles/Dashboard.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<><Navbar /><Landing /></>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/signature-test" element={<SignatureTest />} />
          {/* Redirect /product to /dashboard for backward compatibility */}
          <Route path="/product" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documents" element={<Dashboard />} />
          <Route path="/documents/create" element={<Dashboard />} />
          <Route path="/compliance" element={<Dashboard />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/templates" element={<Dashboard />} />
          <Route path="/dashboard/templates" element={<Dashboard />} />
          <Route path="/template/editor/:templateId" element={<DocumentTemplateEditor />} />
          <Route path="/dashboard/create-document/:templateId" element={<CreateDocument />} />
          <Route path="/document/recipients/:templateId" element={<DocumentRecipients />} />
          <Route path="/document/editor/:documentId" element={<DocumentEditor />} />
          <Route path="/settings/brand" element={<BrandSettings />} />
          <Route path="/gst-filing-summary" element={<GSTFilingSummaryPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
