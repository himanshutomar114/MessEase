import Product from "../model/product.model.js";

export const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, text } = req.body;
    const userId = req.user._id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === userId.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "Product already reviewed" });
    }

    const review = {
      user: userId,
      rating,
      text,
    };

    product.reviews.push(review);

    product.averageRating =
      product.reviews.reduce((acc, review) => acc + review.rating, 0) /
      product.reviews.length;
    await product.save();

    const populatedReview = await product.populate("reviews.user", "username");
    const addedReview =
      populatedReview.reviews[populatedReview.reviews.length - 1];

    res.status(201).json(addedReview);
  } catch (error) {
    res.status(500).json({ message: "Error in adding review" });
  }
};

export const getReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).populate(
      "reviews.user",
      "name profilePicture"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product.reviews);
  } catch (error) {
    res.status(500).json({ message: "Error in fetching reviews" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;

    const product = await Product.findById(productId); // ✅ await here
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const Ind = product.reviews.findIndex((r) => r._id.toString() === reviewId); // ✅ use findIndex
    if (Ind === -1) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (product.reviews[Ind].user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this review" });
    }

    // ✅ delete review at index Ind
    product.reviews.splice(Ind, 1);

    if (product.reviews.length > 0) {
      product.averageRating =
        product.reviews.reduce((acc, review) => acc + review.rating, 0) /
        product.reviews.length;
    } else {
      product.averageRating = 0;
    }

    await product.save();
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error in deleting review" });
  }
};

export default {
  addReview,
  getReviews,
  deleteReview,
};
