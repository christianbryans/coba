import { useState, useEffect } from 'react';
import { supabase, Inmate, Activity, ActivityParticipant, Recommendation } from '../lib/supabase';
import toast from 'react-hot-toast';

export const useInmates = () => {
  const [inmates, setInmates] = useState<Inmate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInmates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inmates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInmates(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Error fetching inmates: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addInmate = async (inmateData: Omit<Inmate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('inmates')
        .insert([inmateData])
        .select()
        .single();

      if (error) throw error;
      setInmates(prev => [data, ...prev]);
      toast.success('Napi berhasil ditambahkan');
      return data;
    } catch (err: any) {
      toast.error('Error adding inmate: ' + err.message);
      throw err;
    }
  };

  const updateInmate = async (id: string, updates: Partial<Inmate>) => {
    try {
      const { data, error } = await supabase
        .from('inmates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setInmates(prev => prev.map(inmate => inmate.id === id ? data : inmate));
      toast.success('Data napi berhasil diperbarui');
      return data;
    } catch (err: any) {
      toast.error('Error updating inmate: ' + err.message);
      throw err;
    }
  };

  const deleteInmate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inmates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setInmates(prev => prev.filter(inmate => inmate.id !== id));
      toast.success('Napi berhasil dihapus');
    } catch (err: any) {
      toast.error('Error deleting inmate: ' + err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchInmates();
  }, []);

  return {
    inmates,
    loading,
    error,
    fetchInmates,
    addInmate,
    updateInmate,
    deleteInmate
  };
};

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Error fetching activities: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async (activityData: Omit<Activity, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('🚀 Starting activity creation with data:', activityData);

      // For demo mode, use a simplified approach
      const insertData = {
        title: activityData.title,
        description: activityData.description || null,
        start_date: activityData.start_date,
        end_date: activityData.end_date || null,
        max_participants: Number(activityData.max_participants) || 20,
        instructor_name: activityData.instructor_name || null,
        location: activityData.location || null,
        status: activityData.status || 'planned',
        // Use null for demo mode to avoid RLS issues
        created_by: null
      };

      console.log('� Sending to Supabase:', insertData);

      const { data, error } = await supabase
        .from('activities')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Provide more specific error messages
        if (error.code === '42501') {
          throw new Error('Permission denied - RLS policy blocking insert');
        } else if (error.code === '23502') {
          throw new Error('Required field missing: ' + error.message);
        } else {
          throw error;
        }
      }
      
      console.log('✅ Activity created successfully:', data);
      setActivities(prev => [data, ...prev]);
      toast.success('Kegiatan berhasil ditambahkan');
      return data;
    } catch (err: any) {
      console.error('❌ Full error:', err);
      
      // More user-friendly error messages
      let errorMessage = 'Gagal menambahkan kegiatan';
      if (err.message.includes('Permission denied')) {
        errorMessage = 'Tidak memiliki izin untuk menambahkan kegiatan';
      } else if (err.message.includes('Required field')) {
        errorMessage = 'Ada field yang wajib diisi: ' + err.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setActivities(prev => prev.map(activity => activity.id === id ? data : activity));
      toast.success('Kegiatan berhasil diperbarui');
      return data;
    } catch (err: any) {
      toast.error('Error updating activity: ' + err.message);
      throw err;
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setActivities(prev => prev.filter(activity => activity.id !== id));
      toast.success('Kegiatan berhasil dihapus');
    } catch (err: any) {
      toast.error('Error deleting activity: ' + err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return {
    activities,
    loading,
    error,
    fetchActivities,
    addActivity,
    updateActivity,
    deleteActivity
  };
};

export const useActivityParticipants = (activityId?: string) => {
  const [participants, setParticipants] = useState<ActivityParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('activity_participants')
        .select(`
          *,
          activity:activities(*),
          inmate:inmates(*)
        `);

      if (activityId) {
        query = query.eq('activity_id', activityId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setParticipants(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Error fetching participants: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addParticipant = async (participantData: Omit<ActivityParticipant, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('activity_participants')
        .insert([participantData])
        .select(`
          *,
          activity:activities(*),
          inmate:inmates(*)
        `)
        .single();

      if (error) throw error;
      setParticipants(prev => [data, ...prev]);
      toast.success('Peserta berhasil ditambahkan');
      return data;
    } catch (err: any) {
      toast.error('Error adding participant: ' + err.message);
      throw err;
    }
  };

  const updateParticipant = async (id: string, updates: Partial<ActivityParticipant>) => {
    try {
      const { data, error } = await supabase
        .from('activity_participants')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          activity:activities(*),
          inmate:inmates(*)
        `)
        .single();

      if (error) throw error;
      setParticipants(prev => prev.map(participant => participant.id === id ? data : participant));
      toast.success('Data peserta berhasil diperbarui');
      return data;
    } catch (err: any) {
      toast.error('Error updating participant: ' + err.message);
      throw err;
    }
  };

  const removeParticipant = async (id: string) => {
    try {
      const { error } = await supabase
        .from('activity_participants')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setParticipants(prev => prev.filter(participant => participant.id !== id));
      toast.success('Peserta berhasil dihapus');
    } catch (err: any) {
      toast.error('Error removing participant: ' + err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [activityId]);

  return {
    participants,
    loading,
    error,
    fetchParticipants,
    addParticipant,
    updateParticipant,
    removeParticipant
  };
};

export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recommendations')
        .select(`
          *,
          inmate:inmates(*),
          partner:partners(*),
          recommender:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecommendations(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Error fetching recommendations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addRecommendation = async (recommendationData: Omit<Recommendation, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .insert([recommendationData])
        .select(`
          *,
          inmate:inmates(*),
          partner:partners(*),
          recommender:profiles(*)
        `)
        .single();

      if (error) throw error;
      setRecommendations(prev => [data, ...prev]);
      toast.success('Rekomendasi berhasil dibuat');
      return data;
    } catch (err: any) {
      toast.error('Error creating recommendation: ' + err.message);
      throw err;
    }
  };

  const updateRecommendation = async (id: string, updates: Partial<Recommendation>) => {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          inmate:inmates(*),
          partner:partners(*),
          recommender:profiles(*)
        `)
        .single();

      if (error) throw error;
      setRecommendations(prev => prev.map(rec => rec.id === id ? data : rec));
      toast.success('Rekomendasi berhasil diperbarui');
      return data;
    } catch (err: any) {
      toast.error('Error updating recommendation: ' + err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return {
    recommendations,
    loading,
    error,
    fetchRecommendations,
    addRecommendation,
    updateRecommendation
  };
};

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalInmates: 0,
    activeInmates: 0,
    totalActivities: 0,
    activeActivities: 0,
    totalRecommendations: 0,
    pendingRecommendations: 0,
    dropoutInmates: 0,
    recentActivities: [] as Activity[],
    progressData: [] as { month: string; count: number }[]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch total inmates
      const { count: totalInmates } = await supabase
        .from('inmates')
        .select('*', { count: 'exact', head: true });

      // Fetch active inmates
      const { count: activeInmates } = await supabase
        .from('inmates')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'aktif');

      // Fetch dropout inmates
      const { count: dropoutInmates } = await supabase
        .from('inmates')
        .select('*', { count: 'exact', head: true })
        .in('status', ['dropout', 'bermasalah']);

      // Fetch total activities
      const { count: totalActivities } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true });

      // Fetch active activities
      const { count: activeActivities } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .in('status', ['planned', 'ongoing']);

      // Fetch total recommendations
      const { count: totalRecommendations } = await supabase
        .from('recommendations')
        .select('*', { count: 'exact', head: true });

      // Fetch pending recommendations
      const { count: pendingRecommendations } = await supabase
        .from('recommendations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch recent activities
      const { data: recentActivities } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch progress data for chart (last 12 months)
      const progressData = await fetchProgressData();

      setStats({
        totalInmates: totalInmates || 0,
        activeInmates: activeInmates || 0,
        totalActivities: totalActivities || 0,
        activeActivities: activeActivities || 0,
        totalRecommendations: totalRecommendations || 0,
        pendingRecommendations: pendingRecommendations || 0,
        dropoutInmates: dropoutInmates || 0,
        recentActivities: recentActivities || [],
        progressData
      });
    } catch (err: any) {
      setError(err.message);
      toast.error('Error fetching dashboard stats: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressData = async () => {
    try {
      const { data } = await supabase
        .from('activity_participants')
        .select('enrollment_date')
        .eq('status', 'aktif');

      // Group by month
      const monthlyData: { [key: string]: number } = {};
      const months = [];
      
      // Get last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short' });
        months.push(monthKey);
        monthlyData[monthKey] = 0;
      }

      // Count participants by month
      data?.forEach(participant => {
        const date = new Date(participant.enrollment_date);
        const monthKey = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short' });
        if (monthlyData.hasOwnProperty(monthKey)) {
          monthlyData[monthKey]++;
        }
      });

      return months.map(month => ({
        month,
        count: monthlyData[month]
      }));
    } catch (err) {
      console.error('Error fetching progress data:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    fetchStats
  };
};
