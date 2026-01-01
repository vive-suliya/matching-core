
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMatchingStore } from '@/stores/matching.store';

const profileSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radius: z.number().min(1).max(100),
    categories: z.array(z.string()).optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface Props {
    onNext: () => void;
    onBack: () => void;
}

export default function ProfileInput({ onNext, onBack }: Props) {
    const { profile, setProfile } = useMatchingStore();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            latitude: profile.location?.[0] || 37.5665,
            longitude: profile.location?.[1] || 126.9780,
            radius: (profile.radius ? profile.radius / 1000 : 50),
        },
    });

    const onSubmit = (data: ProfileForm) => {
        setProfile({
            location: [data.latitude, data.longitude],
            radius: data.radius * 1000, // km to meters
            categories: data.categories || [],
        });
        onNext();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 animate-fade-in-up">
            <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    {/* Location Inputs */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white">매칭 기준 위치</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">위도 (Latitude)</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    {...register('latitude', { valueAsNumber: true })}
                                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-5 text-sm font-mono text-white focus:border-purple-500/50 outline-none transition-all shadow-inner"
                                />
                                {errors.latitude && <p className="text-red-400 text-[10px] font-bold px-1">{errors.latitude.message}</p>}
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">경도 (Longitude)</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    {...register('longitude', { valueAsNumber: true })}
                                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-5 text-sm font-mono text-white focus:border-purple-500/50 outline-none transition-all shadow-inner"
                                />
                                {errors.longitude && <p className="text-red-400 text-[10px] font-bold px-1">{errors.longitude.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Radius Input */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white">탐색 반경 설정</h3>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">반경 (킬로미터)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    {...register('radius', { valueAsNumber: true })}
                                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-5 text-sm font-mono text-white focus:border-indigo-500/50 outline-none transition-all shadow-inner"
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-600 uppercase tracking-widest">KM</div>
                            </div>
                            {errors.radius && <p className="text-red-400 text-[10px] font-bold px-1">{errors.radius.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="space-y-8 pt-8">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white">관심 카테고리</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        {['sports', 'study', 'gaming', 'travel', 'dating', 'business'].map(cat => (
                            <label key={cat} className="group relative cursor-pointer">
                                <input type="checkbox" value={cat} {...register('categories')} className="peer sr-only" />
                                <div className="
                                    px-6 py-4 rounded-2xl border border-white/5 bg-white/[0.02] text-center transition-all duration-500
                                    peer-checked:bg-white peer-checked:text-black peer-checked:scale-105 peer-checked:shadow-[0_10px_20px_rgba(255,255,255,0.1)]
                                    group-hover:border-white/20
                                ">
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        {cat === 'sports' ? '스포츠' : cat === 'study' ? '스터디' : cat === 'gaming' ? '게임' : cat === 'travel' ? '여행' : cat === 'dating' ? '연애' : '비즈니스'}
                                    </span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center pt-12 border-t border-white/5">
                <button
                    type="button"
                    onClick={onBack}
                    className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors flex items-center gap-2"
                >
                    <span className="text-lg">←</span> 이전으로
                </button>
                <button
                    type="submit"
                    className="px-12 py-5 bg-white text-black rounded-3xl font-black text-sm uppercase tracking-[0.3em] transition-all hover:scale-105 hover:shadow-[0_20px_40px_rgba(255,255,255,0.2)]"
                >
                    조건 확정 📍
                </button>
            </div>
        </form>
    );
}
