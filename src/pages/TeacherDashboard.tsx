import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { 
  LayoutDashboard, Trophy, Users, BookOpen, TrendingUp, 
  Plus, ArrowRight, Download, Filter, Award, Target, Eye, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/ui/stat-card';
import { AnimatedCard, AnimatedList, AnimatedListItem } from '@/components/ui/animated-container';
import { ChallengesManagement } from '@/components/dashboard/ChallengesManagement';
import { ChallengeForm } from '@/components/dashboard/ChallengeForm';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { generatePDF } from '@/lib/pdf-export';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TeacherDashboard = () => {
  const { user, profile, isTeacher, isLibrarian } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ challenges: 0, participants: 0, booksRead: 0, classStudents: 0 });
  const [challenges, setChallenges] = useState<any[]>([]);
  const [studentProgress, setStudentProgress] = useState<any[]>([]);
  const [studentStats, setStudentStats] = useState<Record<string, { borrowed: number; returned: number }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [challengeModalOpen, setChallengeModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<any>(null);
  const [classFilter, setClassFilter] = useState('managed');

  // Get managed class from profile
  // Teachers manage students from their assigned class
  const managedClass = profile?.class_name;

  useEffect(() => {
    if (isTeacher || isLibrarian) {
      fetchDashboardData();
    }
  }, [isTeacher, isLibrarian, managedClass]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    
    // Fetch challenges created by this user
    const { data: challengesData } = await supabase
      .from('challenges')
      .select('*, challenge_participants(count)')
      .eq('created_by', user?.id)
      .order('created_at', { ascending: false });

    if (challengesData) {
      setChallenges(challengesData);
      const totalParticipants = challengesData.reduce((sum, c) => sum + (c.challenge_participants?.[0]?.count || 0), 0);
      setStats(prev => ({ ...prev, challenges: challengesData.length, participants: totalParticipants }));
    }

    // Fetch students - filter by managed class if teacher has one
    let profilesQuery = supabase.from('profiles').select('*');
    
    if (managedClass) {
      profilesQuery = profilesQuery.eq('class_name', managedClass);
    }
    
    const { data: profilesData } = await profilesQuery.limit(100);

    if (profilesData) {
      setStudentProgress(profilesData);
      setStats(prev => ({ ...prev, classStudents: profilesData.length }));

      // Fetch borrowing stats for each student
      const studentIds = profilesData.map(p => p.user_id);
      if (studentIds.length > 0) {
        const { data: borrowingData } = await supabase
          .from('borrowing_records')
          .select('user_id, status')
          .in('user_id', studentIds);

        if (borrowingData) {
          const statsMap: Record<string, { borrowed: number; returned: number }> = {};
          borrowingData.forEach(record => {
            if (!statsMap[record.user_id]) {
              statsMap[record.user_id] = { borrowed: 0, returned: 0 };
            }
            if (record.status === 'borrowed' || record.status === 'overdue') {
              statsMap[record.user_id].borrowed++;
            } else if (record.status === 'returned') {
              statsMap[record.user_id].returned++;
            }
          });
          setStudentStats(statsMap);
          
          const totalReturned = Object.values(statsMap).reduce((sum, s) => sum + s.returned, 0);
          setStats(prev => ({ ...prev, booksRead: totalReturned }));
        }
      }
    }

    setIsLoading(false);
  };

  const fetchChallenges = async () => {
    const { data } = await supabase
      .from('challenges')
      .select('*, challenge_participants(id, user_id, progress, completed)')
      .eq('created_by', user?.id)
      .order('created_at', { ascending: false });
    if (data) setChallenges(data);
  };

  const exportStudentReport = () => {
    const reportData = studentProgress.map(s => ({
      name: s.full_name || 'Unknown',
      class: s.class_name || '-',
      house: s.house_name || '-',
      currentlyBorrowed: studentStats[s.user_id]?.borrowed || 0,
      totalReturned: studentStats[s.user_id]?.returned || 0,
    }));

    generatePDF({
      title: `Student Reading Report${managedClass ? ` - ${managedClass}` : ''}`,
      subtitle: `Generated by ${profile?.full_name || 'Teacher'}`,
      generatedBy: profile?.full_name || 'Teacher',
      data: reportData,
      columns: [
        { header: 'Student Name', key: 'name' },
        { header: 'Class', key: 'class' },
        { header: 'House', key: 'house' },
        { header: 'Currently Borrowed', key: 'currentlyBorrowed' },
        { header: 'Books Read', key: 'totalReturned' },
      ],
    });
  };

  if (!user || (!isTeacher && !isLibrarian)) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <LayoutDashboard className="h-16 w-16 mx-auto text-primary mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Access Restricted</h1>
          <p className="text-muted-foreground mb-6">Teacher access required</p>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </Layout>
    );
  }

  const filteredStudents = studentProgress.filter(s => {
    if (classFilter === 'managed' && managedClass) {
      return s.class_name === managedClass;
    }
    if (classFilter !== 'all' && classFilter !== 'managed') {
      return s.class_name?.includes(classFilter);
    }
    return true;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent-orange to-accent-orange/80 flex items-center justify-center shadow-lg">
              <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">Teacher Dashboard</h1>
              <p className="text-muted-foreground">
                Manage challenges and track student progress
                {managedClass && <Badge variant="secondary" className="ml-2">{managedClass}</Badge>}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard title="My Challenges" value={stats.challenges} icon={Trophy} iconColor="text-accent-gold" iconBg="bg-accent-gold/10" />
          <StatCard title="Participants" value={stats.participants} icon={Users} iconColor="text-primary" iconBg="bg-primary/10" />
          <StatCard title="Books Read" value={stats.booksRead} icon={BookOpen} iconColor="text-accent-green" iconBg="bg-accent-green/10" />
          <StatCard title={managedClass ? `${managedClass} Students` : 'Students'} value={stats.classStudents} icon={TrendingUp} iconColor="text-accent-orange" iconBg="bg-accent-orange/10" />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
            <TabsTrigger value="challenges" className="rounded-lg">My Challenges</TabsTrigger>
            <TabsTrigger value="students" className="rounded-lg">My Students</TabsTrigger>
            <TabsTrigger value="leaderboard" className="rounded-lg">Leaderboard</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Quick Actions */}
              <AnimatedCard delay={0.1} className="bg-card rounded-xl p-6 shadow-sm border">
                <h2 className="font-display text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { title: 'New Challenge', icon: Plus, onClick: () => { setEditingChallenge(null); setChallengeModalOpen(true); }, color: 'text-accent-gold' },
                    { title: 'View Students', icon: Users, onClick: () => setActiveTab('students'), color: 'text-primary' },
                    { title: 'Export Report', icon: Download, onClick: exportStudentReport, color: 'text-accent-green' },
                    { title: 'Leaderboard', icon: Trophy, onClick: () => setActiveTab('leaderboard'), color: 'text-accent-orange' },
                  ].map((action) => (
                    <Button
                      key={action.title}
                      variant="outline"
                      className="h-auto py-4 justify-start gap-3 hover:border-primary/50"
                      onClick={action.onClick}
                    >
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                      {action.title}
                    </Button>
                  ))}
                </div>
              </AnimatedCard>

              {/* Recent Challenges */}
              <AnimatedCard delay={0.2} className="bg-card rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-semibold">My Active Challenges</h2>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('challenges')}>
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                {challenges.filter(c => c.status === 'active').length > 0 ? (
                  <AnimatedList className="space-y-3">
                    {challenges.filter(c => c.status === 'active').slice(0, 3).map((challenge) => (
                      <AnimatedListItem key={challenge.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <span className="text-2xl">{challenge.badge_icon || '🏆'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{challenge.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {challenge.challenge_participants?.[0]?.count || 0} participants
                            {challenge.target_class && ` • ${challenge.target_class}`}
                          </p>
                        </div>
                        <Badge variant="default">
                          {challenge.status}
                        </Badge>
                      </AnimatedListItem>
                    ))}
                  </AnimatedList>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="font-medium">No active challenges</p>
                    <Button variant="link" onClick={() => setChallengeModalOpen(true)}>
                      Create your first challenge
                    </Button>
                  </div>
                )}
              </AnimatedCard>

              {/* Top Students */}
              <AnimatedCard delay={0.3} className="bg-card rounded-xl p-6 shadow-sm border lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-semibold">
                    Top Readers {managedClass && `in ${managedClass}`}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('students')}>
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {studentProgress
                    .filter(s => !managedClass || s.class_name === managedClass)
                    .sort((a, b) => (studentStats[b.user_id]?.returned || 0) - (studentStats[a.user_id]?.returned || 0))
                    .slice(0, 4)
                    .map((student, i) => (
                      <div key={student.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          i === 0 ? 'bg-accent-gold text-accent-gold-foreground' :
                          i === 1 ? 'bg-muted-foreground/30 text-foreground' :
                          i === 2 ? 'bg-accent-orange/30 text-accent-orange' : 'bg-muted text-muted-foreground'
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{student.full_name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">
                            {studentStats[student.user_id]?.returned || 0} books read
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </AnimatedCard>
            </div>
          </TabsContent>

          {/* Challenges - Teachers can only create class/house competitions */}
          <TabsContent value="challenges">
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Challenge Restrictions</CardTitle>
                <CardDescription>
                  As a teacher, you can create <strong>class competitions</strong> and <strong>house competitions</strong> for your students.
                  {managedClass && <> Challenges will be targeted to <strong>{managedClass}</strong> by default.</>}
                </CardDescription>
              </CardHeader>
            </Card>
            <ChallengesManagement showOnlyMyChallenge={true} restrictToClass={true} />
          </TabsContent>

          {/* Students */}
          <TabsContent value="students">
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
              <h2 className="font-semibold text-lg">
                Student Progress {managedClass && `- ${managedClass}`}
              </h2>
              <div className="flex gap-2">
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by class" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {managedClass && <SelectItem value="managed">My Class ({managedClass})</SelectItem>}
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="7A">Grade 7A</SelectItem>
                    <SelectItem value="7B">Grade 7B</SelectItem>
                    <SelectItem value="8A">Grade 8A</SelectItem>
                    <SelectItem value="8B">Grade 8B</SelectItem>
                    <SelectItem value="9A">Grade 9A</SelectItem>
                    <SelectItem value="9B">Grade 9B</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={exportStudentReport}>
                  <Download className="h-4 w-4 mr-1" />Export
                </Button>
              </div>
            </div>
            <div className="border rounded-lg overflow-auto bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>House</TableHead>
                    <TableHead>Currently Borrowed</TableHead>
                    <TableHead>Books Read</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No students found {managedClass && `in ${managedClass}`}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.slice(0, 20).map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.full_name || 'Unknown'}</TableCell>
                        <TableCell>{student.class_name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{student.house_name || '-'}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={studentStats[student.user_id]?.borrowed > 0 ? 'text-accent-orange font-medium' : ''}>
                            {studentStats[student.user_id]?.borrowed || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-accent-green">
                            {studentStats[student.user_id]?.returned || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Leaderboard */}
          <TabsContent value="leaderboard">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Class Leaderboard */}
              <AnimatedCard delay={0.1} className="bg-card rounded-xl p-6 shadow-sm border">
                <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-accent-gold" />
                  Top Classes
                </h2>
                <div className="space-y-3">
                  {['Grade 8A', 'Grade 7B', 'Grade 8B', 'Grade 7A', 'Grade 9A'].map((cls, i) => (
                    <div key={cls} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        i === 0 ? 'bg-accent-gold text-accent-gold-foreground' :
                        i === 1 ? 'bg-muted-foreground/30 text-foreground' :
                        i === 2 ? 'bg-accent-orange/30 text-accent-orange' : 'bg-muted text-muted-foreground'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{cls}</p>
                        <Progress value={100 - i * 15} className="h-2 mt-1" />
                      </div>
                      <span className="font-semibold">{150 - i * 20}</span>
                    </div>
                  ))}
                </div>
              </AnimatedCard>

              {/* House Leaderboard */}
              <AnimatedCard delay={0.2} className="bg-card rounded-xl p-6 shadow-sm border">
                <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  House Rankings
                </h2>
                <div className="space-y-3">
                  {[
                    { name: 'Phoenix', color: 'bg-destructive/20 text-destructive', books: 245 },
                    { name: 'Dragon', color: 'bg-accent-green/20 text-accent-green', books: 230 },
                    { name: 'Griffin', color: 'bg-accent-gold/20 text-accent-gold', books: 215 },
                    { name: 'Pegasus', color: 'bg-primary/20 text-primary', books: 198 },
                  ].map((house, i) => (
                    <div key={house.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${house.color}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{house.name}</p>
                        <p className="text-xs text-muted-foreground">{house.books} books read</p>
                      </div>
                      {i === 0 && <span className="text-2xl">👑</span>}
                    </div>
                  ))}
                </div>
              </AnimatedCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Challenge Modal - Restrict to class/house competitions for teachers */}
      <ChallengeForm 
        isOpen={challengeModalOpen} 
        onClose={() => setChallengeModalOpen(false)} 
        challenge={editingChallenge}
        onSuccess={fetchChallenges}
        restrictToClass={true}
        defaultClass={managedClass}
      />
    </Layout>
  );
};

export default TeacherDashboard;
