import React from "react";
import { IDocument } from "../types/document";
import {
  Calendar,
  ClipboardCopy,
  Download,
  Eye,
  Lock,
  Pencil,
  Users,
} from "lucide-react";
import { formatDate } from "../utils";
import { Link } from "react-router";

interface DocumentCardProps {
  document: IDocument;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  return (
    <div className="border-2 border-dashed border-gray-300 p-4 relative">
      {document.isBlocked && (
        <div className="absolute top-2 right-2">
          <Lock className="h-6 w-6 text-black" />
        </div>
      )}

      <div className="flex justify-center mb-4">
        <div className="bg-black rounded-full p-6 w-24 h-24 flex items-center justify-center">
          <div className="bg-white w-12 h-14 relative">
            <div className="absolute top-2 left-2 w-1 h-1 bg-black rounded-full"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-black"></div>
            <div className="absolute top-5 left-2 w-8 h-1 bg-black"></div>
            <div className="absolute top-7 left-2 w-8 h-1 bg-black"></div>
            <div className="absolute top-9 left-2 w-8 h-1 bg-black"></div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center">
          <Users className="h-5 shrink-0 w-5 mr-2" />
          <span className="font-medium">Ijrochilar</span>
          <span className="ml-8">{document.performers.join(", ")}</span>
        </div>

        <div className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          <span className="font-medium">sana</span>
          <span className="ml-8">{formatDate(document.expiryDate)}</span>
        </div>

        <div className="flex items-center">
          <button>
            <ClipboardCopy className="h-5 w-5 mr-2" />
          </button>

          <span className="font-medium">Holati</span>
          <span className="ml-8">{document.tags.join(", ")}</span>
        </div>
      </div>

      <div className="flex justify-between mt-4 pt-2">
        <Link
          to={`/documents/edit/${document._id}`}
          className="border-2 border-dashed border-gray-300 p-2"
        >
          <Pencil className="h-5 w-5" />
        </Link>
        <button className="border-2 border-dashed border-gray-300 p-2">
          <Eye className="h-5 w-5" />
        </button>
        <a
          href={document.filePath}
          className="border-2 border-dashed border-gray-300 p-2"
        >
          <Download className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
};

export default DocumentCard;
