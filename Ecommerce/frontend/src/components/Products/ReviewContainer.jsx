import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteReview, postReview } from "../../store/slices/productSlice";
import { Star } from "lucide-react";
const ReviewsContainer = ({ product, productReviews }) => {
  const {authUser} = useSelector(state => state.auth);
  const {isReviewDeleting, isPostingReview} = useSelector(state => state.product);
  
  const dispatch = useDispatch();
  const [rating,setRating] = useState(1);
  const [comment,setComment] = useState("");
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("rating",rating);
    data.append("comment",comment);
    dispatch(postReview({
      productID:product.id, review:data
    }));
  }
  return <>
  
  {
    authUser && (
      <form onSubmit={handleReviewSubmit} className="mb-8 space-y-4">
        <h4 className="text-lg font-semibold">Leave a Review </h4>
        <div className="flex items-center space-x-2">
          {
            [...Array(5)].map((_,index)=>{
              return (
                <button key={index} type="button" onClick={
                  () => setRating(index+1)
                } className={`text-2xl ${index < rating ? "text-yellow-400":"text-gray-300"}`}
              > 
              {/* Star icom emoji */}
                Star
              </button>
              )
            })
          }
        </div>
        <textarea value={comment} onChange={(e)=> setComment(e.target.value)} rows={4} placeholder="write your rating comments" className="w-full p-3 rounded-md border border-border bg-background"/>
          <button type="submit" disabled={isPostingReview} className="px-6 py-2 rounded-lg bg-primary text-white font-semibold hover:glow-on-hover animate-smooth disabled:opacity-50">
            {
              isPostingReview?"Submitting...": "Submit Review"
            }
          </button>
      </form>
    )
  }

  <h3 className="text-xl font-semibold text-foreground mb-6">Customer Review</h3>
  {
    productReviews && productReviews.length > 0 ? ( <div className="space-y-6">
       { productReviews.map((reviews) => {
        return(
            <div key={reviews.review_id} className="glass-card p-6">
              <div className="flex items-center space-x-4">
                <img src={reviews.reviewer?.avatar?.url || "/avatar-holder.avif"} alt={reviews?.reviewer?.name}
                className="w-12 h-12 rounded-full text-foreground"/>
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h4 className="font-semibold text-foreground">{  reviews?.reviewer?.name }</h4>
                    <div className="flex">
                      {
                        [...Array(5)].map((_,i)=>{
                        return (
                        <Star key={i} className={`w-4 h-4 ${i< Math.floor(review.ratings)
                          ?"text-yellow-400 fill-current":"text-gray-300"
                        }`}
                        />
                      );
                      })}
                    </div>
                      <p className="text-muted-foreground mb-2">{reviews.comment}</p>
                      {
                        authUser?.id === reviews.reviewer?.id && (

                          <button onClick={()=> dispatch(deleteReview({productID:product.id, reviewId:reviews.review_id}))}
                          className="my-6 w-fit flex items-center space-x-3 p-3 rounded-lg glass-card hover-glow-on-hover text-destructive hover:text-destructive-foreground group "
                          >
                            {
                              isReviewDeleting? (
                                <>
                                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> 


                                 <span>Delete Review...</span>
                                </>
                              ):(<span>  Delete Review  </span>)
                            }
                          </button>
                        )
                      }
                  </div>
                </div>
              </div>
            </div>
          )
        }
      )
    }
      </div>
    ):( <p> No reviews yet...Be the first one to review one this. </p> ) } 
      </>;
};

export default ReviewsContainer;