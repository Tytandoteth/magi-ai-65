import { ResponseGenerator } from './formatting/ResponseGenerator';
import { ResponseType } from '@/types/formatting';

export const formatContent = (content: string): string => {
  // Format numbers with commas
  content = content.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  // Format percentages to 2 decimal places
  content = content.replace(/(\d+\.\d+)%/g, (match) => {
    const num = parseFloat(match);
    return num.toFixed(2) + "%";
  });

  return content;
};

export const createMagiResponse = (data: any, type: ResponseType) => {
  console.log('Creating Magi response:', { type, data });
  return ResponseGenerator.createResponse(data, type);
};