
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
            radius: (profile.radius ? profile.radius / 1000 : 5),
        },
    });

    const onSubmit = (data: ProfileForm) => {
        setProfile({
            location: [data.latitude, data.longitude],
            radius: data.radius * 1000, // km to meters
            categories: data.categories,
        });
        onNext();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-fade-in">
            <div className="glass-card p-8 rounded-xl border border-white/10">
                <h2 className="text-2xl font-bold mb-6 text-white">매칭 조건 설정</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Location Inputs */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-purple-400">📍 현재 위치</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">위도 (Latitude)</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    {...register('latitude', { valueAsNumber: true })}
                                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-white"
                                />
                                {errors.latitude && <p className="text-red-400 text-xs mt-1">{errors.latitude.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">경도 (Longitude)</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    {...register('longitude', { valueAsNumber: true })}
                                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-white"
                                />
                                {errors.longitude && <p className="text-red-400 text-xs mt-1">{errors.longitude.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Radius Input */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-purple-400">🎯 탐색 범위</h3>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">반경 (km)</label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                {...register('radius', { valueAsNumber: true })}
                                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-white"
                            />
                            {errors.radius && <p className="text-red-400 text-xs mt-1">{errors.radius.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="mt-8">
                    <label className="block text-sm font-medium mb-4 text-gray-400">카테고리 (다중 선택 가능)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['sports', 'study', 'gaming', 'travel', 'dating', 'business'].map(cat => (
                            <label key={cat} className="flex items-center space-x-3 p-3 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer">
                                <input type="checkbox" value={cat} {...register('categories')} className="w-4 h-4 accent-purple-600 rounded" />
                                <span className="capitalize text-gray-300">{cat}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                >
                    ← 이전 단계
                </button>
                <button
                    type="submit"
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                    다음 단계 →
                </button>
            </div>
        </form>
    );
}
