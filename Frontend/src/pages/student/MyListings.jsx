import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/axiosRequest.js";
import Header from "../../components/Header.jsx";

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await api.get("/api/marketplace/my-listings", {
          withCredentials: true,
        });
        setListings(response.data);
      } catch (err) {
        console.error("Error fetching listings:", err);
        setError("Failed to load listings.");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await api.delete(`/api/marketplace/products/${id}`, {
        withCredentials: true,
      });
      setListings((prev) => prev.filter((product) => product._id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Failed to delete product.");
    }
  };

  const markAsSold = async (id) => {
    try {
      await api.put(
        `/api/marketplace/products/${id}/mark-sold`,
        {},
        { withCredentials: true }
      );
      setListings((prev) =>
        prev.map((product) =>
          product._id === id ? { ...product, sold: true } : product
        )
      );
    } catch (err) {
      console.error("Error marking product as sold:", err);
      setError("Failed to update product status.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div>
        <Header />
        <div className="min-h-screen bg-gray-900 text-white p-4 flex justify-center items-center">
          <div className="bg-red-900/50 p-6 rounded-lg border border-red-700 max-w-md w-full">
            <h2 className="text-xl font-bold text-red-300 mb-2">Error</h2>
            <p className="text-white">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="p-6 bg-gray-900 min-h-screen flex flex-col items-center">
        <h2 className="text-3xl font-bold text-white mb-6">My Listings</h2>
        {listings.length === 0 ? (
          <p className="text-gray-400">You haven't listed any products yet.</p>
        ) : (
          <div className="w-full max-w-3xl space-y-4">
            {listings.map((product) => (
              <div
                key={product._id}
                className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 flex items-center"
              >
                {/* Clicking image or title navigates to product details */}
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-20 h-20 object-cover rounded-md mr-4 cursor-pointer"
                  onClick={() => navigate(`/marketplace/${product._id}`)}
                />
                <div className="flex-1">
                  <h3
                    className="text-xl text-white cursor-pointer"
                    onClick={() => navigate(`/marketplace/${product._id}`)}
                  >
                    {product.title}
                  </h3>
                  <p className="text-green-400 font-semibold">
                    ₹{product.price}
                  </p>
                  <p
                    className={`text-sm ${product.sold ? "text-red-400" : "text-gray-300"}`}
                  >
                    {product.sold ? "Sold ✅" : "Available"}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/marketplace/edit/${product._id}`}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg"
                  >
                    Edit ✏️
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent accidental navigation
                      deleteProduct(product._id);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                  >
                    Delete 🗑
                  </button>
                  {!product.sold && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent accidental navigation
                        markAsSold(product._id);
                      }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg"
                    >
                      Mark as Sold 🏷
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;
