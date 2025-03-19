import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ResearchResult } from './research-service';

/**
 * Generate a PDF from the research results
 */
export async function generateResearchPDF(
  result: ResearchResult,
  topic: string
): Promise<void> {
  const { summary, sources, detailedAnalysis, relatedTopics } = result;
  
  // Create new PDF document
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Set font styles
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  
  // Add title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Research: ${topic}`, 20, 20);
  
  // Add date and simple header
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 30);
  pdf.line(20, 33, 190, 33);
  
  let yPosition = 40;
  
  // Add summary section
  if (summary) {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Summary', 20, yPosition);
    yPosition += 10;
    
    // Process the summary text in paragraphs
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    // Split summary into paragraphs
    const summaryParagraphs = summary.split('\n').filter(p => p.trim().length > 0);
    
    for (const paragraph of summaryParagraphs) {
      // Split each paragraph into lines that fit the page width
      const lines = pdf.splitTextToSize(paragraph, 170);
      
      // Check if adding these lines would go beyond page height
      if (yPosition + (lines.length * 6) > 280) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.text(lines, 20, yPosition);
      yPosition += (lines.length * 6) + 4;
    }
  }
  
  // Add detailed analysis (if available)
  if (detailedAnalysis) {
    // Add a new page for detailed analysis
    pdf.addPage();
    yPosition = 20;
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detailed Analysis', 20, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    // Split analysis into paragraphs
    const analysisParagraphs = detailedAnalysis.split('\n').filter(p => p.trim().length > 0);
    
    for (const paragraph of analysisParagraphs) {
      // Split each paragraph into lines that fit the page width
      const lines = pdf.splitTextToSize(paragraph, 170);
      
      // Check if adding these lines would go beyond page height
      if (yPosition + (lines.length * 6) > 280) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.text(lines, 20, yPosition);
      yPosition += (lines.length * 6) + 4;
    }
  }
  
  // Add sources and citations
  if (sources && sources.length > 0) {
    // Add a new page for sources
    pdf.addPage();
    yPosition = 20;
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Sources & Citations', 20, yPosition);
    yPosition += 10;
    
    // Group sources by type for organization
    const sourcesByType: Record<string, typeof sources> = {};
    
    for (const source of sources) {
      const sourceType = source.source || 'web';
      if (!sourcesByType[sourceType]) {
        sourcesByType[sourceType] = [];
      }
      sourcesByType[sourceType].push(source);
    }
    
    // Display sources by type
    for (const [sourceType, typeSourcesArray] of Object.entries(sourcesByType)) {
      // Add source type header
      let sourceTypeName = '';
      switch (sourceType) {
        case 'web': sourceTypeName = 'Web Sources'; break;
        case 'wikipedia': sourceTypeName = 'Wikipedia Sources'; break;
        case 'scholar': sourceTypeName = 'Academic Sources'; break;
        case 'github': sourceTypeName = 'GitHub Sources'; break;
        case 'news': sourceTypeName = 'News Sources'; break;
        default: sourceTypeName = `${sourceType} Sources`;
      }
      
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(sourceTypeName, 20, yPosition);
      yPosition += 8;
      
      // List each source with citation
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      for (let i = 0; i < typeSourcesArray.length; i++) {
        const source = typeSourcesArray[i];
        
        // Create a citation in a simple format
        const citationLines = pdf.splitTextToSize(
          `[${i+1}] ${source.title}`,
          170
        );
        
        if (yPosition + (citationLines.length * 5) + 15 > 280) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Add the citation
        pdf.setFont('helvetica', 'bold');
        pdf.text(citationLines, 20, yPosition);
        yPosition += (citationLines.length * 5) + 2;
        
        // Add the URL
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 255); // Blue for URLs
        const urlLines = pdf.splitTextToSize(`URL: ${source.link}`, 170);
        pdf.text(urlLines, 20, yPosition);
        yPosition += (urlLines.length * 5);
        
        // Add the snippet if available
        if (source.snippet) {
          pdf.setTextColor(80, 80, 80); // Gray for snippets
          pdf.setFont('helvetica', 'italic');
          const snippetLines = pdf.splitTextToSize(
            `Description: ${source.snippet.substring(0, 200)}${source.snippet.length > 200 ? '...' : ''}`,
            170
          );
          
          if (yPosition + (snippetLines.length * 5) + 10 > 280) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.text(snippetLines, 20, yPosition);
          yPosition += (snippetLines.length * 5) + 8;
        } else {
          yPosition += 8;
        }
        
        // Reset text color
        pdf.setTextColor(0, 0, 0);
      }
    }
  }
  
  // Add related topics
  if (relatedTopics && relatedTopics.length > 0) {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    } else {
      yPosition += 10;
    }
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Related Research Topics', 20, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    for (const topic of relatedTopics) {
      const topicLines = pdf.splitTextToSize(`• ${topic}`, 170);
      
      if (yPosition + (topicLines.length * 6) > 280) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.text(topicLines, 20, yPosition);
      yPosition += (topicLines.length * 6) + 2;
    }
  }
  
  // Save the PDF
  const filename = `Research_${topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().getTime()}.pdf`;
  pdf.save(filename);
} 