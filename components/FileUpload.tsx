import React, { useRef, useState } from 'react';
import { Spinner } from './Spinner';

interface FileUploadProps {
  title: string;
  description: string;
  acceptedFiles: string;
  onFileProcess: (file: File) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ title, description, acceptedFiles, onFileProcess, isLoading }) => {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];

    if (file) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = acceptedFiles.split(',').map(ext => ext.trim());
      
      if (!allowedExtensions.includes(fileExtension)) {
        setError(`Archivo no válido. Por favor, seleccione un archivo ${acceptedFiles}.`);
        return;
      }
      onFileProcess(file);
    }
    // Reset file input to allow re-uploading the same file
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div className="my-4 p-6 bg-gray-800 rounded-lg border border-gray-700 text-center h-full flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-semibold text-gray-200 mb-2">{title}</h2>
        <p className="text-sm text-gray-400 mb-4">{description}</p>
        <div className="flex items-center justify-center w-full">
            <label htmlFor={`dropzone-file-${title}`} className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg bg-gray-700 ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-600'} transition-colors`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    <p className="text-xs text-gray-400"><span className="font-semibold">Click para cargar</span> o arrastrar</p>
                </div>
                <input 
                    id={`dropzone-file-${title}`}
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange} 
                    accept={acceptedFiles}
                    disabled={isLoading}
                    ref={fileInputRef}
                />
            </label>
        </div> 
      </div>
      <div className="mt-4 min-h-[56px]">
        {isLoading && <Spinner />}
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    </div>
  );
};
