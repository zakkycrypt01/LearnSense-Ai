'use client';
import { useState, useRef, type DragEvent } from 'react';
import { UploadCloud } from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './loading-spinner';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentUploaderProps {
  onFileUpload: (file: { name: string; content: string }) => void;
  isProcessing: boolean;
}

export function DocumentUploader({ onFileUpload, isProcessing }: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          onFileUpload({ name: file.name, content });
        };
        reader.readAsText(file);
      } else if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          try {
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            let textContent = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const text = await page.getTextContent();
              textContent += text.items.map((s: any) => s.str).join(' ');
            }
            onFileUpload({ name: file.name, content: textContent });
          } catch (error) {
            console.error('Error parsing PDF:', error);
            toast({
              title: 'PDF Parsing Error',
              description: 'Could not extract text from the PDF.',
              variant: 'destructive',
            });
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        toast({
          title: 'Unsupported File Type',
          description: 'Please upload a .txt or .pdf file.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isProcessing) {
        handleFileChange(e.dataTransfer.files);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Upload Your Document</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300',
            isDragging ? 'border-primary bg-primary/10' : 'border-border',
            isProcessing ? 'cursor-not-allowed bg-muted/50' : 'cursor-pointer hover:border-primary/50 hover:bg-muted/50'
          )}
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".txt,.pdf"
            onChange={(e) => handleFileChange(e.target.files)}
            disabled={isProcessing}
          />
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <LoadingSpinner />
                <p>Processing...</p>
            </div>
          ) : (
            <>
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                    Drag & drop a .txt or .pdf file here, or click to select a file.
                </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
