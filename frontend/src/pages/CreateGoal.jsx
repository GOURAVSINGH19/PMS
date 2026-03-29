import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Target, Calendar, Award, UserPlus, 
  ChevronRight, ArrowLeft, Zap, Info, ShieldCheck
} from 'lucide-react';
import Layout from '../components/Layout';
import { goalService, userService } from '../api';
import { GoalLevel, GoalTag, GoalPriority, PRIORITY_WEIGHTAGE } from '../constants/enums';
import { useAuthStore } from '../store/auth';
import toast from 'react-hot-toast';

const COLORS = {
  bg: "#F5F4F0",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  border: "#E4E2DC",
  accent: "#2563EB",
  accentDim: "#1D4ED8",
  emerald: "#059669",
  amber: "#D97706",
  rose: "#DC2626",
  violet: "#7C3AED",
  text: "#111111",
  muted: "#6B7280",
  subtle: "#9CA3AF",
};

export default function CreateGoal() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [remainingWeightage, setRemainingWeightage] = useState(100);
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const watchTag = watch('tag');
  const watchPriority = watch('priority');
  const watchOwner = watch('owner_id');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (watchTag && (currentUser.role === 'employee' || watchOwner)) {
      checkWeightage();
    }
  }, [watchTag, watchOwner, watchPriority]);

  const loadUsers = async () => {
    if (currentUser.role === 'employee') {
      setUsers([currentUser]);
      return;
    }
    try {
      const response = await userService.getAll();
      let filteredUsers = response.data;
      if (currentUser.role === 'manager') {
        filteredUsers = filteredUsers.filter(u =>
          u.team_id === currentUser.team_id || u.id === currentUser.id
        );
      }
      setUsers(filteredUsers);
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  const checkWeightage = async () => {
    try {
      const ownerId = currentUser.role === 'employee' ? currentUser.id : watchOwner;
      const response = await goalService.checkWeightage(ownerId, watchTag);
      setRemainingWeightage(response.data.remaining_weightage);
    } catch (error) {
      console.error('Failed to check weightage');
    }
  };

  const onSubmit = async (data) => {
    if (currentUser.role === 'employee') {
      data.owner_id = currentUser.id;
    }
    const goalWeightage = PRIORITY_WEIGHTAGE[data.priority];
    if (goalWeightage > remainingWeightage) {
      toast.error(`Weightage guardrail triggered. Only ${remainingWeightage}% remaining.`);
      return;
    }

    setLoading(true);
    try {
      await goalService.create(data);
      toast.success('Goal created successfully');
      navigate('/goals');
    } catch (error) {
      toast.error('Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const selectedWeightage = watchPriority ? PRIORITY_WEIGHTAGE[watchPriority] : 0;

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 800, margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
           <button onClick={() => navigate(-1)} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, padding: 8, borderRadius: 10, cursor: "pointer", color: COLORS.muted }}>
              <ArrowLeft size={16} />
           </button>
           <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.03em" }}>Create New Goal</h1>
              <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 4 }}>Define a new goal with priority and weightage allocation</p>
           </div>
        </div>

        <div style={{
          background: COLORS.card, border: `1.5px solid ${COLORS.border}`,
          borderRadius: 24, padding: 32, display: "flex", flexDirection: "column", gap: 32,
          boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
        }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Title Section */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Goal Title</label>
              <input type="text" placeholder="e.g. Increase quarterly revenue by 15%" {...register('title', { required: true })}
                style={{ padding: "12px 16px", border: `1.5px solid ${COLORS.border}`, borderRadius: 12, fontSize: 14, outline: "none", background: COLORS.bg }} />
              {errors.title && <span style={{ fontSize: 11, color: COLORS.rose, fontWeight: 600 }}>Goal title is required</span>}
            </div>

            {/* Description */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</label>
              <textarea rows="4" placeholder="Describe the goal and expected outcome..." {...register('description')}
                style={{ padding: "12px 16px", border: `1.5px solid ${COLORS.border}`, borderRadius: 12, fontSize: 14, outline: "none", background: COLORS.bg, resize: "none" }} />
            </div>

            {/* Meta Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
               <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                 <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Goal Level</label>
                 <select {...register('level', { required: true })} style={{ padding: "12px 16px", border: `1.5px solid ${COLORS.border}`, borderRadius: 12, fontSize: 14, outline: "none", background: "#fff" }}>
                    <option value="">Select Level</option>
                    {Object.values(GoalLevel).map((level) => <option key={level} value={level}>{level.toUpperCase()}</option>)}
                 </select>
               </div>
               <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                 <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Category Tag</label>
                 <select {...register('tag', { required: true })} style={{ padding: "12px 16px", border: `1.5px solid ${COLORS.border}`, borderRadius: 12, fontSize: 14, outline: "none", background: "#fff" }}>
                    <option value="">Select Tag</option>
                    {Object.values(GoalTag).map((tag) => <option key={tag} value={tag}>{tag.toUpperCase()}</option>)}
                 </select>
               </div>
            </div>

            {/* Priority & Planning */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
               <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                 <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Priority</label>
                 <select {...register('priority', { required: true })} style={{ padding: "12px 16px", border: `1.5px solid ${COLORS.border}`, borderRadius: 12, fontSize: 14, outline: "none", background: "#fff" }}>
                    <option value="">Select Priority</option>
                    {Object.entries(PRIORITY_WEIGHTAGE).map(([p, w]) => <option key={p} value={p}>{p.toUpperCase()} ({w}%)</option>)}
                 </select>
               </div>
               <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                 <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Start Date</label>
                 <input type="date" {...register('start_date', { required: true })}
                   style={{ padding: "12px 16px", border: `1.5px solid ${COLORS.border}`, borderRadius: 12, fontSize: 14, outline: "none", background: "#fff" }} />
               </div>
            </div>

            {/* Guardrail Status */}
            {watchTag && (currentUser.role !== 'employee' ? watchOwner : true) && (
              <div style={{
                background: remainingWeightage >= selectedWeightage ? `${COLORS.emerald}08` : `${COLORS.rose}08`,
                border: `1.5px solid ${remainingWeightage >= selectedWeightage ? COLORS.emerald : COLORS.rose}25`,
                borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", gap: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                   <ShieldCheck size={18} color={remainingWeightage >= selectedWeightage ? COLORS.emerald : COLORS.rose} />
                   <span style={{ fontSize: 14, fontWeight: 800, color: remainingWeightage >= selectedWeightage ? COLORS.emerald : COLORS.rose }}>Weightage Check</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted }}>Current Weightage Used</span>
                   <span style={{ fontSize: 14, fontWeight: 800 }}>{100 - remainingWeightage}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted }}>This Goal's Weightage</span>
                   <span style={{ fontSize: 14, fontWeight: 800, color: COLORS.accent }}>+{selectedWeightage}%</span>
                </div>
                <div style={{ width: "100%", height: 6, background: COLORS.bg, borderRadius: 10, overflow: "hidden", marginTop: 4 }}>
                   <div style={{ width: `${100 - remainingWeightage + selectedWeightage}%`, height: "100%", background: remainingWeightage >= selectedWeightage ? COLORS.emerald : COLORS.rose }} />
                </div>
                {remainingWeightage < selectedWeightage && (
                  <p style={{ fontSize: 11, color: COLORS.rose, fontWeight: 600, marginTop: 4 }}>⚠ Warning: Selecting this priority exceeds the 100% threshold for {watchTag} class.</p>
                )}
              </div>
            )}

            {/* Assignee */}
            {currentUser.role !== 'employee' && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Assign To</label>
                <select {...register('owner_id', { required: true })} style={{ padding: "12px 16px", border: `1.5px solid ${COLORS.border}`, borderRadius: 12, fontSize: 14, outline: "none", background: "#fff" }}>
                  <option value="">Select User</option>
                   {users.map((user) => <option key={user.id} value={user.id}>{user.name} ({user.role})</option>)}
                </select>
              </div>
            )}

            {/* Footer Actions */}
            <div style={{ display: "flex", gap: 16, paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
               <button type="button" onClick={() => navigate(-1)}
                 style={{ flex: 1, padding: "14px", borderRadius: 12, border: `1.5px solid ${COLORS.border}`, background: "#fff", color: COLORS.muted, fontWeight: 700, cursor: "pointer" }}>
                 Cancel
               </button>
               <button type="submit" disabled={loading || (watchTag && remainingWeightage < selectedWeightage)}
                 style={{ flex: 2, padding: "14px", borderRadius: 12, border: "none", background: COLORS.accent, color: "#fff", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: (loading || (watchTag && remainingWeightage < selectedWeightage)) ? 0.6 : 1 }}>
                 {loading ? "Creating..." : (remainingWeightage < selectedWeightage ? "Weightage Exceeded" : "Create Goal")}
                 {!loading && remainingWeightage >= selectedWeightage && <Zap size={16} />}
               </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div style={{
          background: `${COLORS.violet}08`, border: `1.5px dashed ${COLORS.violet}40`,
          borderRadius: 20, padding: "20px 24px", display: "flex", gap: 16,
        }}>
           <Info size={20} color={COLORS.violet} style={{ flexShrink: 0 }} />
           <p style={{ fontSize: 12, color: COLORS.violet, fontWeight: 500, lineHeight: 1.6 }}>
             Goals are sent for approval once created. Make sure all details are accurate before submitting.
           </p>
        </div>

      </div>
    </Layout>
  );
}
