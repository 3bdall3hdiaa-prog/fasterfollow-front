import { useAuthStore } from '@/store/auth.store'
import { useThemeStore } from '@/store/theme.store'
import axios from 'axios'
import { useState, useEffect, useMemo } from 'react'

const Reviews = ({ serviceId, setAvrgRating, setNumReviews }: { serviceId: string, setAvrgRating: any, setNumReviews: any }) => {
    const [reviews, setReviews] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const { isDark } = useThemeStore()
    const { user } = useAuthStore()
    const avrgRating = useMemo(() => {
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
            return (totalRating / reviews.length).toFixed(1);
        }
        return null;
    }, [reviews]);
    useEffect(() => {
        setAvrgRating(avrgRating)
    }, [avrgRating])
    // State for new review
    const [newReview, setNewReview] = useState({
        rating: 0,
        comment: '',
        username: ''
    })
    const [hoverRating, setHoverRating] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)

    // Get user from localStorage

    useEffect(() => {
        getReviews()
    }, [serviceId])

    const getReviews = async () => {
        try {
            setLoading(true)
            setError(false)
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/reviews/${serviceId}`)
            if (res.data) {
                setReviews(res.data)
                setNumReviews(res.data.length)
            }
        } catch (error) {
            console.error('Error fetching reviews:', error)
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    const getColorFromName = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 70%, 60%)`;
    };

    // Handle star click
    const handleStarClick = (rating: number) => {
        setNewReview(prev => ({ ...prev, rating }))
    }

    // Handle star hover
    const handleStarHover = (rating: number) => {
        setHoverRating(rating)
    }

    const handleStarLeave = () => {
        setHoverRating(0)
    }

    // Handle comment change
    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewReview(prev => ({ ...prev, comment: e.target.value }))
    }

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (newReview.rating === 0) {
            alert('⚠️ يرجى اختيار تقييم بالنجوم')
            return
        }
        if (!newReview.comment.trim()) {
            alert('⚠️ يرجى كتابة تعليق')
            return
        }

        setSubmitting(true)

        try {
            const reviewData = {
                userId: user._id,
                username: user.username || 'مستخدم',
                serviceId: serviceId,
                rating: newReview.rating,
                comment: newReview.comment.trim(),
            }

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/reviews`, reviewData)

            if (res.data) {
                setSubmitSuccess(true)
                setNewReview({ rating: 0, comment: '', username: '' })
                setHoverRating(0)

                // Refresh reviews
                await getReviews()

                // Hide success message after 3 seconds
                setTimeout(() => {
                    setSubmitSuccess(false)
                }, 3000)
            }
        } catch (error: any) {
            console.error('Error submitting review:', error)
            alert(error.response?.data?.message || '❌ حدث خطأ في إرسال التقييم')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className='mt-[50px] py-4'>
            <div>
                {loading && <h1 className='text-center text-2xl font-bold text-gray-400'>جاري تحميل البيانات...</h1>}
                {error && <h1 className='text-center text-2xl font-bold text-gray-400'>حدث خطأ</h1>}

                <div className='px-4'>
                    <p className='text-md text-black font-bold'>{reviews.length} تقييم</p>

                    {/* ====== إضافة تقييم جديد ====== */}
                    <div className={`
                        rounded-xl p-6 mb-8
                        ${isDark
                            ? 'bg-gray-800/50 border border-gray-700/50'
                            : ' border border-gray-200/80'
                        }
                    `}>
                        <h3 className={`
                            text-xl font-bold mb-4
                            ${isDark ? 'text-white' : 'text-gray-800'}
                        `}>
                            ✍️ أضف تقييمك
                        </h3>

                        <form onSubmit={handleSubmit}>
                            {/* اختيار النجوم */}
                            <div className="mb-4">
                                <label className={`
                                    block text-sm font-medium mb-2
                                    ${isDark ? 'text-gray-300' : 'text-gray-700'}
                                `}>
                                    التقييم بالنجوم
                                </label>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => {
                                        const starValue = i + 1
                                        const isActive = starValue <= (hoverRating || newReview.rating)

                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => handleStarClick(starValue)}
                                                onMouseEnter={() => handleStarHover(starValue)}
                                                onMouseLeave={handleStarLeave}
                                                className={`
                                                    text-3xl transition-all duration-200
                                                    focus:outline-none
                                                    ${isActive
                                                        ? 'text-yellow-400 scale-110'
                                                        : isDark ? 'text-gray-600' : 'text-gray-300'
                                                    }
                                                    hover:scale-125 hover:text-yellow-400
                                                `}
                                            >
                                                ★
                                            </button>
                                        )
                                    })}
                                    <span className={`
                                        mr-2 text-sm
                                        ${isDark ? 'text-gray-400' : 'text-gray-500'}
                                    `}>
                                        {newReview.rating > 0 ? `(${newReview.rating}.0)` : 'اختر التقييم'}
                                    </span>
                                </div>
                            </div>

                            {/* كتابة التعليق */}
                            <div className="mb-4">
                                <label className={`
                                    block text-sm font-medium mb-2
                                    ${isDark ? 'text-gray-300' : 'text-gray-700'}
                                `}>
                                    تعليقك
                                </label>
                                <textarea
                                    value={newReview.comment}
                                    onChange={handleCommentChange}
                                    rows={3}
                                    className={`
                                        w-full rounded-lg p-3 resize-none
                                        focus:ring-2 focus:ring-[#c9a84c] focus:border-transparent
                                        transition-all duration-300
                                        ${isDark
                                            ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border border-gray-300 text-gray-800 placeholder-gray-400'
                                        }
                                    `}
                                    placeholder="اكتب تجربتك مع هذه الخدمة..."
                                    maxLength={500}
                                />
                                <div className={`
                                    text-xs mt-1 text-left
                                    ${isDark ? 'text-gray-400' : 'text-gray-500'}
                                `}>
                                    {newReview.comment.length}/500
                                </div>
                            </div>

                            {/* زر الإرسال */}
                            <div className="flex items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`
                                        px-6 py-2.5 rounded-lg font-semibold
                                        transition-all duration-300
                                        flex items-center gap-2
                                        ${submitting
                                            ? 'opacity-50 cursor-not-allowed bg-gray-400'
                                            : isDark
                                                ? 'bg-[#c9a84c] hover:bg-[#b8973a] text-white'
                                                : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                                        }
                                    `}
                                >
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                            جاري الإرسال...
                                        </>
                                    ) : (
                                        'إرسال التقييم'
                                    )}
                                </button>

                                {submitSuccess && (
                                    <span className="text-green-500 font-semibold flex items-center gap-1">
                                        ✅ تم إرسال تقييمك بنجاح!
                                    </span>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* ====== عرض التقييمات ====== */}
                    {reviews.map((review: any, index: number) => {
                        const userName = review.username || review.name || 'مستخدم';
                        const initial = userName.charAt(0).toUpperCase();
                        const backgroundColor = getColorFromName(userName);

                        return (
                            <div
                                key={review._id}
                                className={`
                                    py-6 
                                    ${isDark
                                        ? 'border-t border-b border-gray-700/50'
                                        : 'border-t border-b border-gray-200/50'
                                    }
                                    ${index === 0 ? 'border-t-0' : ''}
                                    ${index === reviews.length - 1 ? 'border-b-0' : ''}
                                `}
                            >
                                <div className="flex items-start justify-between">
                                    {/* الجهة اليمنى */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`
                                                    w-12 h-12 rounded-full 
                                                    flex items-center justify-center 
                                                    text-white font-bold text-lg
                                                    ring-2 
                                                    ${isDark ? 'ring-gray-600' : 'ring-[#dfd7bb]'}
                                                    transition-colors duration-300
                                                    flex-shrink-0
                                                `}
                                                style={{ backgroundColor }}
                                            >
                                                {initial}
                                            </div>

                                            <div>
                                                <h3 className={`
                                                    font-semibold text-base
                                                    ${isDark ? 'text-white' : 'text-gray-800'}
                                                `}>
                                                    {userName}
                                                </h3>

                                                <div className="flex items-center gap-1 mt-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span
                                                            key={i}
                                                            className={`
                                                                text-sm transition-colors duration-200
                                                                ${i < (review.rating || 4)
                                                                    ? 'text-yellow-400'
                                                                    : isDark ? 'text-gray-600' : 'text-gray-300'
                                                                }
                                                            `}
                                                        >
                                                            ★
                                                        </span>
                                                    ))}
                                                    <span className={`
                                                        text-xs mr-1
                                                        ${isDark ? 'text-gray-400' : 'text-gray-500'}
                                                    `}>
                                                        ({review.rating || 4}.0)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className={`
                                            mt-3 pr-2 text-sm leading-relaxed
                                            ${isDark ? 'text-gray-300' : 'text-gray-700'}
                                        `}>
                                            {review.review || review.comment || 'لم يتم كتابة تقييم'}
                                        </p>
                                    </div>

                                    <div className={`
                                        text-xs whitespace-nowrap pt-1
                                        ${isDark ? 'text-gray-500' : 'text-gray-400'}
                                    `}>
                                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString('ar-EG', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        }) : 'تاريخ غير محدد'}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}

export default Reviews