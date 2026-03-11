import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Font, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { SixMonthReport } from '@/types/SixMonthReport';

// Register fonts if needed
// Font.register({
//   family: 'Roboto',
//   src: '/fonts/Roboto-Regular.ttf'
// });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #000000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  subsection: {
    marginBottom: 10,
    marginLeft: 10,
  },
  text: {
    fontSize: 10,
    marginBottom: 5,
  },
  boldText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  column: {
    flexDirection: 'column',
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    marginRight: 5,
  },
  value: {
    fontSize: 10,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    padding: 5,
    fontSize: 9,
    flex: 1,
  },
  tableCellHeader: {
    padding: 5,
    fontSize: 9,
    fontWeight: 'bold',
    flex: 1,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginVertical: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  badge: {
    backgroundColor: '#e0e0e0',
    padding: '3 8',
    borderRadius: 10,
    fontSize: 8,
    marginRight: 5,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 20,
    right: 30,
    color: '#666666',
  },
  list: {
    marginLeft: 15,
  },
  listItem: {
    fontSize: 10,
    marginBottom: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f8f8',
    marginHorizontal: 5,
    borderRadius: 5,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 9,
    color: '#666666',
  },
});

interface ReportPDFProps {
  report: SixMonthReport;
  clientInfo?: any;
}

// PDF Document Component
const ReportPDFDocument: React.FC<ReportPDFProps> = ({ report, clientInfo }) => {
  const getTrendSymbol = (trend: string) => {
    switch (trend) {
      case 'improving': return '↑';
      case 'declining': return '↓';
      default: return '→';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#ff0000';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#666666';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Six-Month Summary Report</Text>
          <Text style={styles.subtitle}>
            {report.report_type.replace('_', ' ')} | {format(new Date(report.start_date), 'MMM d, yyyy')} - {format(new Date(report.end_date), 'MMM d, yyyy')}
          </Text>
        </View>

        {/* Client Information */}
        {clientInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Client Information</Text>
            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.text}>
                  <Text style={styles.label}>Name:</Text> {clientInfo.name}
                </Text>
                <Text style={styles.text}>
                  <Text style={styles.label}>Date of Birth:</Text> {clientInfo.date_of_birth}
                </Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.text}>
                  <Text style={styles.label}>Client ID:</Text> {clientInfo.client_id}
                </Text>
                <Text style={styles.text}>
                  <Text style={styles.label}>Gender:</Text> {clientInfo.gender}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Executive Summary */}
        {report.executive_summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{report.executive_summary.total_visits}</Text>
                <Text style={styles.statLabel}>Total Visits</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{report.executive_summary.total_hours}</Text>
                <Text style={styles.statLabel}>Total Hours</Text>
              </View>
            </View>

            <Text style={styles.boldText}>Overall Progress: {report.executive_summary.overall_progress}</Text>

            {report.executive_summary.key_achievements.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.boldText}>Key Achievements:</Text>
                <View style={styles.list}>
                  {report.executive_summary.key_achievements.map((achievement, idx) => (
                    <Text key={idx} style={styles.listItem}>• {achievement}</Text>
                  ))}
                </View>
              </View>
            )}

            {report.executive_summary.areas_of_concern.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.boldText}>Areas of Concern:</Text>
                <View style={styles.list}>
                  {report.executive_summary.areas_of_concern.map((concern, idx) => (
                    <Text key={idx} style={styles.listItem}>• {concern}</Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Skills Progress */}
        {report.skills_progress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills Progress</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCellHeader}>Skill Area</Text>
                <Text style={styles.tableCellHeader}>Baseline</Text>
                <Text style={styles.tableCellHeader}>Current</Text>
                <Text style={styles.tableCellHeader}>Change</Text>
              </View>
              {Object.entries(report.skills_progress).map(([skill, data]: [string, any]) => (
                <View key={skill} style={styles.tableRow}>
                  <Text style={styles.tableCell}>
                    {skill.replace('_', ' ').charAt(0).toUpperCase() + skill.slice(1)}
                  </Text>
                  <Text style={styles.tableCell}>{data.baseline}%</Text>
                  <Text style={styles.tableCell}>{data.current}%</Text>
                  <Text style={[styles.tableCell, { color: data.current > data.baseline ? '#4caf50' : '#ff0000' }]}>
                    {data.current > data.baseline ? '+' : ''}{data.current - data.baseline}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Page Number */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} fixed />
      </Page>

      {/* Second Page - Behavioral Management */}
      {report.behavioral_management && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Behavioral Management</Text>
            
            {report.behavioral_management.behaviors.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.boldText}>Behavioral Patterns:</Text>
                {report.behavioral_management.behaviors.map((behavior, idx) => (
                  <View key={idx} style={{ marginBottom: 10 }}>
                    <Text style={styles.boldText}>
                      {behavior.behavior} - {behavior.frequency} occurrences {getTrendSymbol(behavior.trend)}
                    </Text>
                    {behavior.interventions.length > 0 && (
                      <Text style={styles.text}>
                        Interventions: {behavior.interventions.join(', ')}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {report.behavioral_management.successful_interventions.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.boldText}>Successful Interventions:</Text>
                <View style={styles.list}>
                  {report.behavioral_management.successful_interventions.map((intervention, idx) => (
                    <Text key={idx} style={styles.listItem}>• {intervention}</Text>
                  ))}
                </View>
              </View>
            )}
          </View>

          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
            `Page ${pageNumber} of ${totalPages}`
          )} fixed />
        </Page>
      )}

      {/* Third Page - Significant Events & Attendance */}
      <Page size="A4" style={styles.page}>
        {/* Significant Life Events */}
        {report.significant_life_events && report.significant_life_events.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Significant Life Events</Text>
            {report.significant_life_events.map((event, idx) => (
              <View key={idx} style={styles.subsection}>
                <Text style={styles.boldText}>
                  {format(new Date(event.date), 'MMM d, yyyy')} - {event.event}
                </Text>
                <Text style={styles.text}>Category: {event.category}</Text>
                <Text style={styles.text}>Impact: {event.impact}</Text>
                <Text style={styles.text}>Response: {event.response}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Visit Attendance */}
        {report.visit_attendance && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visit Attendance Summary</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{report.visit_attendance.total_scheduled}</Text>
                <Text style={styles.statLabel}>Scheduled</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{report.visit_attendance.total_attended}</Text>
                <Text style={styles.statLabel}>Attended</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{report.visit_attendance.attendance_rate}%</Text>
                <Text style={styles.statLabel}>Attendance Rate</Text>
              </View>
            </View>
          </View>
        )}

        {/* Recommendations */}
        {report.recommendations && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            <Text style={styles.text}>{report.recommendations}</Text>
          </View>
        )}

        {/* Goals for Next Period */}
        {report.next_period_goals && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Goals for Next Period</Text>
            <Text style={styles.text}>{report.next_period_goals}</Text>
          </View>
        )}

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};

// Export component with download link
export const ReportPDFExport: React.FC<{ report: SixMonthReport; clientInfo?: any }> = ({ report, clientInfo }) => {
  const filename = `SixMonthReport_${report.id.substring(0, 8)}_${format(new Date(), 'yyyyMMdd')}.pdf`;

  return (
    <PDFDownloadLink
      document={<ReportPDFDocument report={report} clientInfo={clientInfo} />}
      fileName={filename}
    >
      {({ blob, url, loading, error }) =>
        loading ? 'Generating PDF...' : 'Download PDF'
      }
    </PDFDownloadLink>
  );
};

export default ReportPDFDocument;