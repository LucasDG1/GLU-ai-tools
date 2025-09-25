import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, User, ThumbsUp } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Review {
  id: string;
  tool_id: string;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
  helpful_count: number;
}

interface ReviewSectionProps {
  toolId: string;
}

export function ReviewSection({ toolId }: ReviewSectionProps) {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({
    author_name: '',
    rating: 5,
    comment: ''
  });
  const [loading, setLoading] = useState(false);

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-291b20a9`;

  useEffect(() => {
    fetchReviews();
  }, [toolId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${apiUrl}/reviews/${toolId}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const submitReview = async () => {
    if (!newReview.comment.trim()) {
      toast.error('Please add a comment');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          tool_id: toolId,
          author_name: newReview.author_name || t('reviews.anonymous'),
          rating: newReview.rating,
          comment: newReview.comment
        })
      });

      if (response.ok) {
        toast.success(t('common.success'));
        setNewReview({ author_name: '', rating: 5, comment: '' });
        setShowAddReview(false);
        fetchReviews();
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const markHelpful = async (reviewId: string) => {
    try {
      await fetch(`${apiUrl}/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      fetchReviews();
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRate && onRate(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              size={20}
              className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
          </button>
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <MessageCircle className="text-glu-orange" size={24} />
          <h3 className="text-xl font-semibold text-gray-900">{t('reviews.title')}</h3>
          {reviews.length > 0 && (
            <div className="flex items-center space-x-2 ml-4">
              {renderStars(Math.round(averageRating))}
              <span className="text-sm text-glu-gray">
                ({averageRating.toFixed(1)} • {reviews.length} reviews)
              </span>
            </div>
          )}
        </div>
        
        <Button
          onClick={() => setShowAddReview(!showAddReview)}
          className="bg-glu-green text-white hover:bg-glu-green/90"
        >
          {t('tools.addReview')}
        </Button>
      </div>

      {/* Add Review Form */}
      {showAddReview && (
        <div className="bg-glu-light p-6 mb-6">
          <h4 className="font-semibold mb-4">{t('reviews.yourReview')}</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('common.name')} (optional)</label>
              <Input
                value={newReview.author_name}
                onChange={(e) => setNewReview({ ...newReview, author_name: e.target.value })}
                placeholder={t('reviews.anonymous')}
                className="bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('reviews.rating')}</label>
              {renderStars(newReview.rating, true, (rating) => 
                setNewReview({ ...newReview, rating })
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('reviews.comment')}</label>
              <Textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Share your experience with this AI tool..."
                rows={4}
                className="bg-white"
              />
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={submitReview}
                disabled={loading}
                className="bg-glu-orange text-white hover:bg-glu-orange/90"
              >
                {loading ? t('common.loading') : t('reviews.submit')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddReview(false)}
              >
                {t('cms.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-glu-gray">
            <MessageCircle size={48} className="mx-auto mb-3 opacity-50" />
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-glu-light flex items-center justify-center">
                    <User size={20} className="text-glu-gray" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{review.author_name}</p>
                    <div className="flex items-center space-x-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-glu-gray">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
              
              <button
                onClick={() => markHelpful(review.id)}
                className="flex items-center space-x-2 text-sm text-glu-gray hover:text-glu-orange transition-colors"
              >
                <ThumbsUp size={16} />
                <span>Helpful ({review.helpful_count || 0})</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}