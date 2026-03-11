'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  Users,
  Target,
  Brain,
  Heart,
  Activity,
  Home,
  MessageSquare,
  Printer,
} from 'lucide-react';
import { SixMonthReport } from '@/types/SixMonthReport';
import { exportReportToPDF } from '@/use-cases/six-month-report';
import { useToast } from '@/components/ui/use-toast';

interface ReportViewerProps {
  report: SixMonthReport;
  isOpen: boolean;
  onClose: () => void;
}

const ReportViewer: React.FC<ReportViewerProps> = ({ report, isOpen, onClose }) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportData = await exportReportToPDF(report.id);
      
      // Create a blob from the HTML content
      const blob = new Blob([exportData.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = exportData.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'Report exported successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to export report',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive',
    };
    return <Badge variant={variants[severity] || 'default'}>{severity}</Badge>;
  };

  const getResolutionBadge = (status: string) => {
    const variants: Record<string, 'success' | 'default' | 'destructive'> = {
      resolved: 'success',
      ongoing: 'default',
      escalated: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl">Six-Month Summary Report</DialogTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{report.report_type.replace('_', ' ')}</Badge>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(report.start_date), 'MMM d, yyyy')} - 
                  {format(new Date(report.end_date), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button size="sm" onClick={handleExport} disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(90vh-200px)] mt-4">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {report.executive_summary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Executive Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{report.executive_summary.total_visits}</div>
                        <div className="text-sm text-muted-foreground">Total Visits</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{report.executive_summary.total_hours}</div>
                        <div className="text-sm text-muted-foreground">Total Hours</div>
                      </div>
                      <div className="text-center col-span-2">
                        <div className="text-lg font-semibold">{report.executive_summary.overall_progress}</div>
                        <div className="text-sm text-muted-foreground">Overall Progress</div>
                      </div>
                    </div>

                    {report.executive_summary.key_achievements.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Key Achievements
                        </h4>
                        <ul className="list-disc list-inside space-y-1">
                          {report.executive_summary.key_achievements.map((achievement, idx) => (
                            <li key={idx} className="text-sm">{achievement}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {report.executive_summary.areas_of_concern.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          Areas of Concern
                        </h4>
                        <ul className="list-disc list-inside space-y-1">
                          {report.executive_summary.areas_of_concern.map((concern, idx) => (
                            <li key={idx} className="text-sm">{concern}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {report.goals_assessment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Goals Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Achievement Rate</span>
                        <span className="font-semibold">{report.goals_assessment.achievement_rate}%</span>
                      </div>
                      <Progress value={report.goals_assessment.achievement_rate} />
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <div className="text-xl font-bold text-green-600">
                            {report.goals_assessment.goals_achieved}
                          </div>
                          <div className="text-sm text-muted-foreground">Goals Achieved</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-amber-600">
                            {report.goals_assessment.goals_in_progress}
                          </div>
                          <div className="text-sm text-muted-foreground">In Progress</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Behavioral Management Tab */}
            <TabsContent value="behavioral" className="space-y-4">
              {report.behavioral_management && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        Behavioral Patterns
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {report.behavioral_management.behaviors.map((behavior, idx) => (
                          <div key={idx} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium">{behavior.behavior}</div>
                              <div className="flex items-center gap-2">
                                {getTrendIcon(behavior.trend)}
                                <Badge variant="outline">
                                  {behavior.frequency} occurrences
                                </Badge>
                              </div>
                            </div>
                            {behavior.interventions.length > 0 && (
                              <div className="text-sm text-muted-foreground mb-1">
                                <span className="font-medium">Interventions: </span>
                                {behavior.interventions.join(', ')}
                              </div>
                            )}
                            {behavior.outcomes.length > 0 && (
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Outcomes: </span>
                                {behavior.outcomes.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {report.behavioral_management.successful_interventions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Successful Interventions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc list-inside space-y-1">
                          {report.behavioral_management.successful_interventions.map((intervention, idx) => (
                            <li key={idx} className="text-sm">{intervention}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            {/* Skills Progress Tab */}
            <TabsContent value="skills" className="space-y-4">
              {report.skills_progress && (
                <div className="grid gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Communication Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SkillProgressDisplay skill={report.skills_progress.communication} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Self Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SkillProgressDisplay skill={report.skills_progress.self_management} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Socialization
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SkillProgressDisplay skill={report.skills_progress.socialization} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Home className="h-5 w-5" />
                        Daily Living Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SkillProgressDisplay skill={report.skills_progress.daily_living} />
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Significant Events Tab */}
            <TabsContent value="events" className="space-y-4">
              {report.significant_life_events && report.significant_life_events.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Significant Life Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {report.significant_life_events.map((event, idx) => (
                        <div key={idx} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium">{event.event}</div>
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                event.category === 'achievement' ? 'success' :
                                event.category === 'challenge' ? 'destructive' :
                                'default'
                              }>
                                {event.category}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(event.date), 'MMM d')}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div><span className="font-medium">Impact:</span> {event.impact}</div>
                            <div><span className="font-medium">Response:</span> {event.response}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {report.concerns_and_challenges_summary && report.concerns_and_challenges_summary.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Concerns & Challenges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {report.concerns_and_challenges_summary.map((concern, idx) => (
                        <div key={idx} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium flex-1">{concern.concern}</div>
                            <div className="flex items-center gap-2">
                              {getSeverityBadge(concern.severity)}
                              {getResolutionBadge(concern.resolution_status)}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div><span className="font-medium">Action Taken:</span> {concern.action_taken}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(concern.date), 'MMM d, yyyy')}
                              {concern.follow_up_needed && (
                                <Badge variant="outline" className="ml-2">Follow-up needed</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Attendance Tab */}
            <TabsContent value="attendance" className="space-y-4">
              {report.visit_attendance && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Visit Attendance Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{report.visit_attendance.total_scheduled}</div>
                          <div className="text-sm text-muted-foreground">Scheduled</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {report.visit_attendance.total_attended}
                          </div>
                          <div className="text-sm text-muted-foreground">Attended</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-amber-600">
                            {report.visit_attendance.total_cancelled}
                          </div>
                          <div className="text-sm text-muted-foreground">Cancelled</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {report.visit_attendance.total_rescheduled}
                          </div>
                          <div className="text-sm text-muted-foreground">Rescheduled</div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Attendance Rate</span>
                          <span className="font-semibold">{report.visit_attendance.attendance_rate}%</span>
                        </div>
                        <Progress value={report.visit_attendance.attendance_rate} />
                      </div>

                      {report.visit_attendance.cancellation_reasons.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Cancellation Reasons</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {report.visit_attendance.cancellation_reasons.map((reason, idx) => (
                              <li key={idx} className="text-sm">{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-4">
              {report.recommendations && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm">{report.recommendations}</div>
                  </CardContent>
                </Card>
              )}

              {report.next_period_goals && (
                <Card>
                  <CardHeader>
                    <CardTitle>Goals for Next Period</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm">{report.next_period_goals}</div>
                  </CardContent>
                </Card>
              )}

              {report.supervisor_comments && (
                <Card>
                  <CardHeader>
                    <CardTitle>Supervisor Comments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm">{report.supervisor_comments}</div>
                  </CardContent>
                </Card>
              )}

              {report.additional_notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm">{report.additional_notes}</div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// Helper component for skill progress display
const SkillProgressDisplay: React.FC<{ skill: any }> = ({ skill }) => {
  // Handle division by zero when baseline is 0
  const progress = skill.baseline === 0
    ? (skill.current > 0 ? skill.current : 0)
    : ((skill.current - skill.baseline) / skill.baseline) * 100;
  const isPositive = progress >= 0;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Baseline:</span>
            <span className="font-medium">{skill.baseline}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Current:</span>
            <span className="font-medium">{skill.current}%</span>
          </div>
        </div>
        <div className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{progress.toFixed(1)}%
        </div>
      </div>
      
      <Progress value={skill.current} />
      
      {skill.goals_met.length > 0 && (
        <div>
          <h5 className="font-medium text-sm mb-1">Goals Met</h5>
          <ul className="list-disc list-inside space-y-1">
            {skill.goals_met.map((goal: string, idx: number) => (
              <li key={idx} className="text-sm text-muted-foreground">{goal}</li>
            ))}
          </ul>
        </div>
      )}
      
      {skill.areas_for_improvement.length > 0 && (
        <div>
          <h5 className="font-medium text-sm mb-1">Areas for Improvement</h5>
          <ul className="list-disc list-inside space-y-1">
            {skill.areas_for_improvement.map((area: string, idx: number) => (
              <li key={idx} className="text-sm text-muted-foreground">{area}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReportViewer;