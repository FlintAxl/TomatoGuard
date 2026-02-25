import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import * as XLSX from 'xlsx';
import { Paths, File } from 'expo-file-system';

export interface PartDistributionItem {
  part: string;
  count: number;
  percentage: number;
}

export interface DiseaseConfidenceItem {
  disease: string;
  avg_confidence: number;
  count: number;
}

export interface ConfidenceBucket {
  label: string;
  count: number;
}

export interface DiseaseStatItem {
  disease: string;
  count: number;
  percentage: number;
  avg_confidence: number;
}

export interface AnalysisItem {
  id: string;
  disease: string;
  confidence: number;
  plant_part: string;
  created_at: string;
}

export interface ExportData {
  partDistribution: PartDistributionItem[];
  diseaseConfidence: DiseaseConfidenceItem[];
  confidenceBuckets: ConfidenceBucket[];
  diseaseStats: {
    total: number;
    by_part: Record<string, DiseaseStatItem[]>;
  };
  analyses: AnalysisItem[];
  generatedAt: string;
}

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.9) return '#22c55e';
  if (confidence >= 0.7) return '#f59e0b';
  return '#ef4444';
};

const getPartColor = (part: string): string => {
  const colors: Record<string, string> = {
    fruit: '#ef4444',
    leaf: '#22c55e',
    stem: '#f59e0b',
  };
  return colors[part] || '#64748b';
};

const generateHTML = (data: ExportData): string => {
  const { partDistribution, diseaseConfidence, confidenceBuckets, diseaseStats, generatedAt } = data;

  // Calculate totals
  const totalAnalyses = partDistribution.reduce((sum, p) => sum + p.count, 0);
  const fruitTotal = partDistribution.find(p => p.part === 'fruit')?.count || 0;
  const leafTotal = partDistribution.find(p => p.part === 'leaf')?.count || 0;
  const stemTotal = partDistribution.find(p => p.part === 'stem')?.count || 0;

  // Generate disease rows for each part
  const generateDiseaseTable = (part: string, diseases: DiseaseStatItem[]) => {
    if (!diseases || diseases.length === 0) return '';
    
    return diseases.map(d => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #334155; color: ${d.disease === 'Healthy' ? '#22c55e' : '#e2e8f0'};">
          ${d.disease}
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #334155; text-align: center; color: #e2e8f0;">
          ${d.count}
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #334155; text-align: center; color: #94a3b8;">
          ${d.percentage.toFixed(1)}%
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #334155; text-align: center;">
          <span style="color: ${getConfidenceColor(d.avg_confidence)}; font-weight: 600;">
            ${(d.avg_confidence * 100).toFixed(1)}%
          </span>
        </td>
      </tr>
    `).join('');
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TomatoGuard Analytics Report</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #0f172a;
          color: #e2e8f0;
          padding: 40px;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 24px;
          border-bottom: 2px solid #3b82f6;
        }
        .logo {
          font-size: 32px;
          margin-bottom: 8px;
        }
        .title {
          font-size: 28px;
          font-weight: 800;
          color: #f8fafc;
          margin-bottom: 8px;
        }
        .subtitle {
          font-size: 14px;
          color: #64748b;
        }
        .timestamp {
          font-size: 12px;
          color: #475569;
          margin-top: 8px;
        }
        .section {
          margin-bottom: 32px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #3b82f6;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #334155;
        }
        .card {
          background: #1e293b;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
        }
        .overview-grid {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }
        .overview-card {
          flex: 1;
          background: #1e293b;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }
        .overview-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }
        .overview-value {
          font-size: 28px;
          font-weight: 800;
          color: #f8fafc;
        }
        .overview-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          margin-top: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          background: #334155;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #94a3b8;
          font-size: 12px;
          text-transform: uppercase;
        }
        .part-header {
          background: #0f172a;
          padding: 12px;
          margin-top: 16px;
          border-radius: 8px 8px 0 0;
        }
        .part-label {
          font-size: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .confidence-bar {
          height: 8px;
          background: #334155;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 4px;
        }
        .confidence-fill {
          height: 100%;
          border-radius: 4px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #334155;
          color: #475569;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🍅</div>
        <div class="title">TomatoGuard Analytics Report</div>
        <div class="subtitle">Plant Disease Detection Analysis Summary</div>
        <div class="timestamp">Generated: ${generatedAt}</div>
      </div>

      <!-- Overview Section -->
      <div class="section">
        <div class="section-title">📊 Analysis Overview</div>
        <div class="overview-grid">
          <div class="overview-card">
            <div class="overview-icon">📈</div>
            <div class="overview-value">${totalAnalyses}</div>
            <div class="overview-label">Total Analyses</div>
          </div>
          <div class="overview-card" style="border-left: 3px solid #ef4444;">
            <div class="overview-icon">🍅</div>
            <div class="overview-value" style="color: #ef4444;">${fruitTotal}</div>
            <div class="overview-label">Fruit Analyses</div>
          </div>
          <div class="overview-card" style="border-left: 3px solid #22c55e;">
            <div class="overview-icon">🍃</div>
            <div class="overview-value" style="color: #22c55e;">${leafTotal}</div>
            <div class="overview-label">Leaf Analyses</div>
          </div>
          <div class="overview-card" style="border-left: 3px solid #f59e0b;">
            <div class="overview-icon">🌿</div>
            <div class="overview-value" style="color: #f59e0b;">${stemTotal}</div>
            <div class="overview-label">Stem Analyses</div>
          </div>
        </div>
      </div>

      <!-- Plant Part Distribution -->
      <div class="section">
        <div class="section-title">🌱 Plant Part Distribution</div>
        <div class="card">
          <table>
            <thead>
              <tr>
                <th>Part</th>
                <th style="text-align: center;">Count</th>
                <th style="text-align: center;">Percentage</th>
                <th>Distribution</th>
              </tr>
            </thead>
            <tbody>
              ${partDistribution.map(p => `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #334155;">
                    <span style="color: ${getPartColor(p.part)}; font-weight: 600; text-transform: capitalize;">
                      ${p.part === 'fruit' ? '🍅' : p.part === 'leaf' ? '🍃' : '🌿'} ${p.part}
                    </span>
                  </td>
                  <td style="padding: 12px; border-bottom: 1px solid #334155; text-align: center; font-weight: 700;">
                    ${p.count}
                  </td>
                  <td style="padding: 12px; border-bottom: 1px solid #334155; text-align: center; color: #94a3b8;">
                    ${p.percentage.toFixed(1)}%
                  </td>
                  <td style="padding: 12px; border-bottom: 1px solid #334155;">
                    <div class="confidence-bar">
                      <div class="confidence-fill" style="width: ${p.percentage}%; background: ${getPartColor(p.part)};"></div>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p style="margin-top: 12px; font-size: 13px; color: #94a3b8; font-style: italic;">This table shows the distribution of analyses across different tomato plant parts (fruit, leaf, and stem).</p>
        </div>
      </div>

      <!-- Disease Detection by Plant Part -->
      <div class="section">
        <div class="section-title">🔬 Disease Detection by Plant Part</div>
        
        ${Object.entries(diseaseStats.by_part).map(([part, diseases]) => `
          <div class="card" style="margin-bottom: 16px;">
            <div class="part-header" style="background: ${getPartColor(part)}20; border-left: 4px solid ${getPartColor(part)};">
              <div class="part-label" style="color: ${getPartColor(part)};">
                ${part === 'fruit' ? '🍅' : part === 'leaf' ? '🍃' : '🌿'}
                <span style="text-transform: capitalize;">${part} Diseases</span>
                <span style="font-size: 12px; color: #64748b; font-weight: normal; margin-left: auto;">
                  (${diseases.reduce((s, d) => s + d.count, 0)} total)
                </span>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Disease</th>
                  <th style="text-align: center;">Count</th>
                  <th style="text-align: center;">Percentage</th>
                  <th style="text-align: center;">Avg Confidence</th>
                </tr>
              </thead>
              <tbody>
                ${generateDiseaseTable(part, diseases)}
              </tbody>
            </table>
            <p style="margin-top: 12px; font-size: 13px; color: #94a3b8; font-style: italic;">
             The table below displays all diseases identified on this plant part, 
             showing how many times each was detected, its proportion relative to total detections, 
             and the model's average confidence level for each diagnosis.</p>
          </div>
        `).join('')}
      </div>

      <!-- Confidence Distribution -->
      <div class="section">
        <div class="section-title">📉 Confidence Distribution</div>
        <div class="card">
          <table>
            <thead>
              <tr>
                <th>Confidence Range</th>
                <th style="text-align: center;">Count</th>
                <th>Distribution</th>
              </tr>
            </thead>
            <tbody>
              ${confidenceBuckets.map((b, i) => {
                const colors = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981'];
                const maxCount = Math.max(...confidenceBuckets.map(x => x.count), 1);
                const totalCount = confidenceBuckets.reduce((s, x) => s + x.count, 0);
                const pct = totalCount > 0 ? ((b.count / totalCount) * 100).toFixed(1) : '0';
                return `
                  <tr>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #334155; font-weight: 600;">
                      ${b.label}
                    </td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #334155; text-align: center;">
                      ${b.count} <span style="color: #64748b; font-size: 11px;">(${pct}%)</span>
                    </td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #334155;">
                      <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${(b.count / maxCount) * 100}%; background: ${colors[i] || '#6366f1'};"></div>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <p style="margin-top: 12px; font-size: 13px; color: #94a3b8; font-style: italic;">
          This table presents the distribution of model confidence scores across predefined range buckets, 
          giving you insight into how confident our system was when making these identifications.</p>
        </div>
      </div>

      <!-- Average Confidence per Disease -->
      <div class="section">
        <div class="section-title">🎯 Average Confidence per Disease</div>
        <div class="card">
          <table>
            <thead>
              <tr>
                <th>Disease</th>
                <th style="text-align: center;">Sample Count</th>
                <th style="text-align: center;">Avg Confidence</th>
                <th>Confidence Level</th>
              </tr>
            </thead>
            <tbody>
              ${diseaseConfidence.map(d => `
                <tr>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #334155; color: ${d.disease === 'Healthy' ? '#22c55e' : '#e2e8f0'}; font-weight: 500;">
                    ${d.disease}
                  </td>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #334155; text-align: center; color: #94a3b8;">
                    ${d.count}
                  </td>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #334155; text-align: center;">
                    <span style="color: ${getConfidenceColor(d.avg_confidence)}; font-weight: 700;">
                      ${(d.avg_confidence * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #334155;">
                    <div class="confidence-bar">
                      <div class="confidence-fill" style="width: ${d.avg_confidence * 100}%; background: ${getConfidenceColor(d.avg_confidence)};"></div>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p style="margin-top: 12px; font-size: 13px; color: #94a3b8; font-style: italic;">This table summarizes the 
          average confidence level of the model for each detected disease category, giving you insight into which
           diseases the system identifies with the greatest certainty</p>
        </div>
      </div>

      <!-- All Analyses List -->
      <div class="section">
        <div class="section-title">📋 All Analyses (${data.analyses.length} records)</div>
        <div class="card">
          <table>
            <thead>
              <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 35%;">Disease</th>
                <th style="width: 15%;">Plant Part</th>
                <th style="width: 20%;">Confidence</th>
                <th style="width: 25%;">Date</th>
              </tr>
            </thead>
            <tbody>
              ${data.analyses.map((a, index) => {
                const date = new Date(a.created_at);
                const formattedDate = date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                return `
                  <tr>
                    <td style="padding: 8px 12px; border-bottom: 1px solid #334155; color: #64748b; font-size: 11px;">
                      ${index + 1}
                    </td>
                    <td style="padding: 8px 12px; border-bottom: 1px solid #334155; color: ${a.disease === 'Healthy' ? '#22c55e' : '#e2e8f0'}; font-weight: 500;">
                      ${a.disease}
                    </td>
                    <td style="padding: 8px 12px; border-bottom: 1px solid #334155;">
                      <span style="color: ${getPartColor(a.plant_part)}; text-transform: capitalize; font-weight: 500;">
                        ${a.plant_part === 'fruit' ? '🍅' : a.plant_part === 'leaf' ? '🍃' : '🌿'} ${a.plant_part}
                      </span>
                    </td>
                    <td style="padding: 8px 12px; border-bottom: 1px solid #334155; text-align: center;">
                      <span style="color: ${getConfidenceColor(a.confidence)}; font-weight: 700;">
                        ${(a.confidence * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td style="padding: 8px 12px; border-bottom: 1px solid #334155; color: #94a3b8; font-size: 11px;">
                      ${formattedDate}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <p style="margin-top: 12px; font-size: 13px; color: #94a3b8; font-style: italic;">This table contains the complete list of all individual analyses performed, including disease detected, plant part, confidence score, and date.</p>
        </div>
      </div>

      <div class="footer">
        <p>TomatoGuard - Tomato Disease Detection System</p>
        <p>This report was automatically generated from analysis data.</p>
        <p style="margin-top: 8px; font-size: 10px;">Total Records: ${data.analyses.length} | Report ID: ${Date.now()}</p>
      </div>
    </body>
    </html>
  `;
};

export const exportAnalyticsPDF = async (data: ExportData): Promise<void> => {
  try {
    const html = generateHTML(data);
    
    // Create a proper filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `TomatoGuard_Report_${timestamp}.pdf`;

    if (Platform.OS === 'web') {
      // Web: Open print dialog which allows saving as PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        
        // Wait for content to load then trigger print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 250);
        };
        
        // Fallback if onload doesn't fire
        setTimeout(() => {
          printWindow.print();
        }, 500);
      } else {
        // Fallback: use iframe
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);
        
        const iframeDoc = iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(html);
          iframeDoc.close();
          
          setTimeout(() => {
            iframe.contentWindow?.print();
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 1000);
          }, 500);
        }
      }
    } else {
      // Mobile (iOS/Android): Generate PDF file and share
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save Analytics Report',
          UTI: 'com.adobe.pdf',
        });
      } else {
        throw new Error('File sharing is not available on this device.');
      }
    }
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
};

// Excel Export Function
export const exportAnalysesExcel = async (analyses: AnalysisItem[]): Promise<void> => {
  try {
    // Create a proper filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `TomatoGuard_Analyses_${timestamp}.xlsx`;

    // Prepare data for Excel
    const excelData = analyses.map((a, index) => {
      const date = new Date(a.created_at);
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      return {
        '#': index + 1,
        'Disease': a.disease,
        'Plant Part': a.plant_part.charAt(0).toUpperCase() + a.plant_part.slice(1),
        'Confidence (%)': (a.confidence * 100).toFixed(1),
        'Date': formattedDate,
      };
    });

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 5 },   // #
      { wch: 25 },  // Disease
      { wch: 12 },  // Plant Part
      { wch: 15 },  // Confidence
      { wch: 22 },  // Date
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Analyses');

    if (Platform.OS === 'web') {
      // Web: Direct download
      XLSX.writeFile(workbook, fileName);
    } else {
      // Mobile: Write to file and share
      const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
      
      // Create file in cache directory
      const file = new File(Paths.cache, fileName);
      
      // Convert base64 to Uint8Array and write
      const binaryString = atob(wbout);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      await file.write(bytes);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Save Analyses Excel',
          UTI: 'org.openxmlformats.spreadsheetml.sheet',
        });
      } else {
        throw new Error('File sharing is not available on this device.');
      }
    }
  } catch (error) {
    console.error('Error exporting Excel:', error);
    throw error;
  }
};
