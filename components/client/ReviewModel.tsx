const ReviewModal = ({ isDark, showReviewModal, selectedOrder, reviewComment, setReviewComment, reviewRating, setReviewRating, reviewError, reviewSuccess, isSubmittingReview, closeReviewModal, handleSubmitReview, renderStars, getTextColor, getMutedTextColor, set }: any) => {
    if (!showReviewModal || !selectedOrder) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === e.currentTarget) closeReviewModal();
            }}
        >
            <div
                className={`rounded-xl shadow-2xl max-w-md w-full p-4 md:p-6 transition-all max-h-[90vh] overflow-y-auto ${isDark
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-[#dfd7bb]'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg md:text-xl font-bold" style={{ color: getTextColor() }}>
                        تقييم الطلب
                    </h2>
                    <button
                        onClick={closeReviewModal}
                        className={`p-2 rounded-full transition-colors ${isDark
                            ? 'hover:bg-gray-700 text-gray-400'
                            : 'hover:bg-gray-100 text-gray-500'
                            }`}
                        style={{ touchAction: 'manipulation' }}
                    >
                        ✕
                    </button>
                </div>

                <div className="mb-4 space-y-1">
                    <div className="text-sm" style={{ color: getMutedTextColor() }}>
                        رقم الطلب: <span className="font-mono" style={{ color: getTextColor() }}>{selectedOrder.serviceId._id}</span>
                    </div>
                    <div className="text-sm" style={{ color: getMutedTextColor() }}>
                        الخدمة: <span style={{ color: getTextColor() }}>{selectedOrder.serviceId?.title || 'خدمة غير معروفة'}</span>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" style={{ color: getTextColor() }}>
                        التقييم
                    </label>
                    <div className="flex justify-center py-2">
                        {renderStars(reviewRating, true)}
                    </div>
                    <div className="text-center text-sm mt-1" style={{ color: getMutedTextColor() }}>
                        {reviewRating === 1 && 'سيء جداً'}
                        {reviewRating === 2 && 'سيء'}
                        {reviewRating === 3 && 'متوسط'}
                        {reviewRating === 4 && 'جيد'}
                        {reviewRating === 5 && 'ممتاز'}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" style={{ color: getTextColor() }}>
                        التعليق
                    </label>
                    <textarea
                        value={reviewComment}
                        onChange={(e) => {
                            setReviewComment(e.target.value);

                        }}
                        rows={4}
                        placeholder="اكتب تعليقك هنا..."
                        className={`w-full rounded-lg p-3 h-24 md:h-32 resize-none transition-all text-base ${isDark
                            ? 'bg-gray-700 border border-gray-600 text-white'
                            : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                            }`}
                        maxLength={500}
                        style={{
                            fontSize: '16px',
                            touchAction: 'manipulation',
                        }}
                    />
                    <div className="text-xs text-right mt-1" style={{ color: getMutedTextColor() }}>
                        {reviewComment.length}/500
                    </div>
                </div>

                {reviewError && (
                    <div className={`p-3 rounded-lg mb-4 ${isDark
                        ? 'bg-red-900/50 border border-red-700 text-red-300'
                        : 'bg-red-50 border border-red-200 text-red-700'
                        }`}>
                        {reviewError}
                    </div>
                )}

                {reviewSuccess && (
                    <div className={`p-3 rounded-lg mb-4 ${isDark
                        ? 'bg-green-900/50 border border-green-700 text-green-300'
                        : 'bg-green-50 border border-green-200 text-green-700'
                        }`}>
                        {reviewSuccess}
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-3">
                    <button
                        onClick={handleSubmitReview}
                        disabled={isSubmittingReview || !!reviewSuccess}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${isSubmittingReview || reviewSuccess
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                            } ${isDark
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        style={{ touchAction: 'manipulation' }}
                    >
                        {isSubmittingReview ? 'جاري الإرسال...' : reviewSuccess ? '✓ تم الإرسال' : 'إرسال التقييم'}
                    </button>
                    <button
                        onClick={closeReviewModal}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${isDark
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                        style={{ touchAction: 'manipulation' }}
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ReviewModal;