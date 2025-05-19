export interface IDocument {
  _id: string;
  title: string;
  content: string;
  fileName: string;
  fileSize: number;
  filePath: string;
  performers: string[];
  tags: string[];
  expiryDate: Date | null;
  created_by: string;
  isBlocked: boolean;
}
