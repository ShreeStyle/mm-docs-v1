import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import TemplatesPage from './pages/TemplatesPage';
import DocumentTemplateEditor from './pages/DocumentTemplateEditor';
import CreateDocument from './pages/CreateDocument';
import BrandSettings from './pages/BrandSettings';
import DocumentRecipients from './pages/DocumentRecipients';
import DocumentEditor from './pages/DocumentEditor';
import SignatureTest from './pages/SignatureTest';
import './styles/Dashboard.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<><Navbar /><Landing /></>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signature-test" element={<SignatureTest />} />
          <Route path="/product" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/templates" element={<TemplatesPage />} />
          <Route path="/template/editor/:templateId" element={<DocumentTemplateEditor />} />
          <Route path="/dashboard/create-document/:templateId" element={<CreateDocument />} />
          <Route path="/document/recipients/:templateId" element={<DocumentRecipients />} />
          <Route path="/document/editor/:documentId" element={<DocumentEditor />} />
          <Route path="/settings/brand" element={<BrandSettings />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
