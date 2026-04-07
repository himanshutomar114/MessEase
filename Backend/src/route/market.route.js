import express from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
import User from "../model/user.model.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getMyListings,
  getProductById,
  getAllProducts,
  markProductsAsSold,
  buyNow,
  verifyPayment,
  getUserOrders,
} from "../controller/market.controller.js";

import {
  addReview,
  getReviews,
  deleteReview,
} from "../controller/review.controller.js";

import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../controller/wishlist.controller.js";
const router = express.Router();

router.get("/products", verifyJWT, getAllProducts);
router.get("/products/:id", verifyJWT, getProductById);
router.post("/products", verifyJWT, upload.array("images", 5), createProduct);
router.put(
  "/products/:id",
  verifyJWT,
  upload.array("images", 5),
  updateProduct
);
router.delete("/products/:id", verifyJWT, deleteProduct);
router.get("/wishlist/", verifyJWT, getWishlist);
router.post("/wishlist/:productId", verifyJWT, addToWishlist);
router.delete("/wishlist/:productId", verifyJWT, removeFromWishlist);
router.get("/my-listings", verifyJWT, getMyListings);
router.put("/products/:id/mark-sold", verifyJWT, markProductsAsSold);
router.get("/products/:productId/reviews", verifyJWT, getReviews);
router.post("/products/:productId/reviews", verifyJWT, addReview);
router.delete(
  "/products/:productId/reviews/:reviewId",
  verifyJWT,
  deleteReview
);
router.post("/:productId/buy", verifyJWT, buyNow);
router.post("/verify-payment", verifyPayment);
router.get("/orders", verifyJWT, getUserOrders);

router.get("/wishlist-check/:id", verifyJWT, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isInWishlist = user.wishlist.includes(id);
    console.log("checking is in wishlist", isInWishlist);
    res.status(200).json({ isInWishlist: isInWishlist });
  } catch (error) {
    console.error("Error checking wishlist status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
