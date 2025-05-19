import { BrowserRouter as Router, Routes, Route } from "react-router";
import DocumentArchive from "./pages/document-archive";
import "./assets/styles/App.css";
import CreateDocument from "./pages/create-document";
import EditDocument from "./pages/edic-document";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DocumentArchive />} />
        <Route path="/documents/create" element={<CreateDocument />} />
        <Route path="/documents/edit/:id" element={<EditDocument />} />
      </Routes>
    </Router>
  );
}

export default App;
