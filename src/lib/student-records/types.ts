export interface StudentRecordAnalysisResult {
  studentId: string;
  studentName: string;
  html: string;
  generatedAt: string;
}

export interface AnalyzeStudentRecordInput {
  studentId: string;
  studentName: string;
  text: string;
  imageDataUrls: string[];
}
