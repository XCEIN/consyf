"use client";

import Button from "@/components/commons/button";
import Input from "@/components/commons/input";
import Label from "@/components/commons/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { CloudUpload, X, Image as ImageIcon } from "lucide-react";
import { API_URL } from "@/constants/api.const";

const CATEGORIES = [
  "Công nghệ",
  "Nhân sự",
  "Văn phòng",
  "Marketing",
  "Tài chính",
  "Pháp lý",
  "Dịch vụ khác",
];

const LOCATIONS = [
  "Hà Nội",
  "Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bạc Liêu",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Tĩnh",
  "Hải Dương",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
  "Phú Yên",
];

export default function ProjectSection({ accountType }: { accountType?: string }) {
  const [formData, setFormData] = useState({
    type: "buy" as "buy" | "sell",
    title: "",
    description: "",
    category: "",
    budget: "",
    location: "",
    tags: "",
  });

  // Image upload states
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [descriptionImages, setDescriptionImages] = useState<File[]>([]);
  const [descriptionImagePreviews, setDescriptionImagePreviews] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingPostId, setExistingPostId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // State for organization posts list
  const [organizationPosts, setOrganizationPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const isOrganization = accountType === 'organization';

  // Load existing post for personal account OR load posts list for organization
  useEffect(() => {
    // Don't run if accountType is not yet loaded
    if (!accountType) {
      console.log("AccountType not yet loaded, skipping...");
      return;
    }

    const loadExistingPost = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        console.log("Loading posts - accountType:", accountType, "isOrganization:", isOrganization);

        // Get user's own posts
        const response = await fetch(
          `${API_URL}/api/posts/user/my`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Posts data received:", data);
          
          if (isOrganization) {
            // For organization: store posts list for display, don't load into form
            console.log("Organization mode - storing posts list:", data.posts?.length || 0);
            setOrganizationPosts(data.posts || []);
          } else {
            // For personal: load the first (and only) post into form
            if (data.posts && data.posts.length > 0) {
              const myPost = data.posts[0];
              
              if (myPost) {
                // Load post data into form
                setFormData({
                  type: myPost.type || "buy",
                  title: myPost.title || "",
                  description: myPost.description || "",
                  category: myPost.category || "",
                  budget: myPost.budget ? String(myPost.budget) : "",
                  location: myPost.location || "",
                  tags: myPost.tags || "",
                });

                // Load images
                if (myPost.post_image) {
                  setPostImagePreview(myPost.post_image);
                }
                
                if (myPost.description_images) {
                  try {
                    const descImgs = JSON.parse(myPost.description_images);
                    if (Array.isArray(descImgs)) {
                      setDescriptionImagePreviews(descImgs);
                    }
                  } catch (e) {
                    console.error("Failed to parse description_images:", e);
                  }
                }

                setExistingPostId(myPost.id);
                setIsEditMode(true);
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadExistingPost();
  }, [isOrganization]); // Re-run if accountType changes

  // Handle post image upload (organization only)
  const handlePostImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Ảnh phải nhỏ hơn 5MB");
        return;
      }
      setPostImage(file);
      setPostImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  // Handle description images upload (both account types)
  const handleDescriptionImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + descriptionImages.length > 5) {
      setError("Tối đa 5 ảnh mô tả");
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError("Mỗi ảnh phải nhỏ hơn 5MB");
        return false;
      }
      return true;
    });

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setDescriptionImages([...descriptionImages, ...validFiles]);
    setDescriptionImagePreviews([...descriptionImagePreviews, ...newPreviews]);
    setError(null);
  };

  const removePostImage = () => {
    // Only revoke if it's a blob URL (starts with 'blob:')
    if (postImagePreview && postImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(postImagePreview);
    }
    setPostImage(null);
    setPostImagePreview(null);
  };

  const removeDescriptionImage = (index: number) => {
    const preview = descriptionImagePreviews[index];
    // Only revoke if it's a blob URL (starts with 'blob:')
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setDescriptionImages(descriptionImages.filter((_, i) => i !== index));
    setDescriptionImagePreviews(descriptionImagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Frontend validation
    if (!formData.title.trim()) {
      setError("Vui lòng nhập tiêu đề");
      return;
    }
    if (formData.title.trim().length < 3) {
      setError("Tiêu đề phải có ít nhất 3 ký tự");
      return;
    }
    if (!formData.description.trim()) {
      setError("Vui lòng nhập mô tả chi tiết");
      return;
    }
    if (formData.description.trim().length < 10) {
      setError("Mô tả phải có ít nhất 10 ký tự");
      return;
    }
    if (!formData.category) {
      setError("Vui lòng chọn danh mục");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập để đăng bài");
        return;
      }

      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setError("Không tìm thấy thông tin người dùng");
        return;
      }

      const user = JSON.parse(userStr);

      let companyId;
      try {
        const companiesResponse = await fetch(
          `${API_URL}/api/companies/my`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (companiesResponse.ok) {
          const companiesData = await companiesResponse.json();
          if (companiesData.companies && companiesData.companies.length > 0) {
            companyId = companiesData.companies[0].id;
          }
        }
      } catch (err) {
        console.log("No existing company found");
      }

      if (!companyId) {
        const createCompanyResponse = await fetch(
          `${API_URL}/api/companies`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: user.name + "'s Company",
              sector: formData.category,
            }),
          }
        );

        if (!createCompanyResponse.ok) {
          throw new Error("Không thể tạo công ty");
        }

        const companyData = await createCompanyResponse.json();
        companyId = companyData.companyId;
      }

      // Step 1: Upload images if any NEW files
      let uploadedPostImage = postImagePreview || undefined; // Keep existing preview if no new file
      let uploadedDescriptionImages = descriptionImagePreviews.length > 0 
        ? JSON.stringify(descriptionImagePreviews) 
        : undefined; // Keep existing previews if no new files

      if (postImage || descriptionImages.length > 0) {
        const imageFormData = new FormData();
        
        if (postImage) {
          imageFormData.append('post_image', postImage);
        }
        
        descriptionImages.forEach(img => {
          imageFormData.append('description_images', img);
        });

        const uploadResponse = await fetch(
          `${API_URL}/api/posts/upload-images`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: imageFormData,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error("Không thể upload ảnh");
        }

        const uploadData = await uploadResponse.json();
        if (uploadData.post_image) {
          uploadedPostImage = uploadData.post_image;
        }
        if (uploadData.description_images) {
          uploadedDescriptionImages = JSON.stringify(uploadData.description_images);
        }
      }

      // Step 2: Create or Update post
      // Convert tags string to array
      const tagsArray = formData.tags 
        ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        : undefined;

      const postData: any = {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        location: formData.location || undefined,
        tags: tagsArray,
        post_image: uploadedPostImage,
        description_images: uploadedDescriptionImages,
      };

      // Only add company_id for new posts (not editing)
      if (!isEditMode) {
        postData.company_id = companyId;
      } else {
        // If editing, set status back to pending for re-approval
        postData.status = 'pending';
      }

      let response;
      if (isEditMode && existingPostId) {
        // Update existing post
        response = await fetch(
          `${API_URL}/api/posts/${existingPostId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(postData),
          }
        );
      } else {
        // Create new post
        response = await fetch(
          `${API_URL}/api/posts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(postData),
          }
        );
      }

      if (!response.ok) {
        let errorMessage = "Đăng bài thất bại";
        try {
          const result = await response.json();
          console.error('Server error response:', result);
          console.error('Full response:', JSON.stringify(result, null, 2));
          if (result && result.message) {
            errorMessage = result.message;
          } else if (result && result.error) {
            // Zod validation error format
            if (typeof result.error === 'object') {
              const errors: string[] = [];
              Object.entries(result.error).forEach(([field, value]: [string, any]) => {
                if (value?._errors?.length > 0) {
                  errors.push(value._errors[0]);
                }
              });
              errorMessage = errors.length > 0 ? errors.join('. ') : 'Dữ liệu không hợp lệ';
            } else {
              errorMessage = result.error;
            }
          } else if (result && result.errors) {
            errorMessage = `${isEditMode ? 'Cập nhật' : 'Đăng bài'} thất bại: ${JSON.stringify(result.errors)}`;
          } else {
            errorMessage = isEditMode ? "Cập nhật thất bại" : "Đăng bài thất bại";
          }
        } catch (e) {
          console.error('Error parsing response:', e);
          errorMessage = isEditMode ? "Cập nhật thất bại" : "Đăng bài thất bại";
        }
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      setSuccess(isEditMode 
        ? "Cập nhật dự án thành công! Bài đăng sẽ được admin xét duyệt lại." 
        : "Đăng bài thành công! Bài đăng sẽ được admin xét duyệt.");
      
      // Reload posts list for organization
      if (isOrganization) {
        const postsResponse = await fetch(
          `${API_URL}/api/posts/user/my`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setOrganizationPosts(postsData.posts || []);
        }
      }
      
      // Reset form for new post (organization can create multiple)
      // For personal in edit mode, keep the data
      if (isOrganization && !isEditMode) {
        setFormData({
          type: "buy",
          title: "",
          description: "",
          category: "",
          budget: "",
          location: "",
          tags: "",
        });
        
        // Reset images
        setPostImage(null);
        setPostImagePreview(null);
        setDescriptionImages([]);
        setDescriptionImagePreviews([]);
      } else if (isEditMode) {
        // Clear only the File objects, keep previews (from URLs)
        setPostImage(null);
        setDescriptionImages([]);
      }
    } catch (err: any) {
      console.error("Post error:", err);
      setError(err.message || "Đã xảy ra lỗi khi đăng bài");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("rounded-[20px] border", "px-8 py-6")}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">
          {isEditMode ? "Thông tin dự án của bạn" : "Đăng bài dự án"}
        </h2>
        {isEditMode && (
          <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Đang chỉnh sửa
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Loại bài đăng <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="buy"
                checked={formData.type === "buy"}
                onChange={(e) =>
                  setFormData({ ...formData, type: "buy" })
                }
                className="w-4 h-4"
              />
              <span>Cần mua</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="sell"
                checked={formData.type === "sell"}
                onChange={(e) =>
                  setFormData({ ...formData, type: "sell" })
                }
                className="w-4 h-4"
              />
              <span>Cung cấp</span>
            </label>
          </div>
          <p className="text-xs text-gray-500">
            {formData.type === "buy"
              ? "Bạn đang tìm kiếm dịch vụ/sản phẩm"
              : "Bạn đang cung cấp dịch vụ/sản phẩm"}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            Tiêu đề ngắn gọn <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="VD: Cần tìm đối tác phát triển phần mềm"
            className="w-full"
            maxLength={255}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Mô tả chi tiết <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Mô tả chi tiết về nhu cầu hoặc dịch vụ của bạn. Thông tin này sẽ được sử dụng để tìm kiếm đối tác phù hợp."
            className="w-full min-h-[150px]"
            rows={6}
          />
          <p className="text-xs text-gray-500">
            Mô tả càng chi tiết càng giúp hệ thống tìm được đối tác phù hợp
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">
            Danh mục <span className="text-red-500">*</span>
          </Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Chọn danh mục --</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget" className="text-sm font-medium">
            Ngân sách / Giá (VNĐ){" "}
            <span className="text-gray-400">(tùy chọn)</span>
          </Label>
          <Input
            id="budget"
            type="number"
            value={formData.budget}
            onChange={(e) =>
              setFormData({ ...formData, budget: e.target.value })
            }
            placeholder="VD: 50000000"
            className="w-full"
            min="0"
          />
          <p className="text-xs text-gray-500">
            Nhập số tiền dự kiến (không bắt buộc)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium">
            Vị trí địa lý (Tỉnh/Thành){" "}
            <span className="text-gray-400">(tùy chọn)</span>
          </Label>
          <select
            id="location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Chọn tỉnh/thành --</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags" className="text-sm font-medium">
            Tags <span className="text-gray-400">(tùy chọn)</span>
          </Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) =>
              setFormData({ ...formData, tags: e.target.value })
            }
            placeholder="VD: startup, fintech, blockchain"
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            Phân tách các tag bằng dấu phẩy
          </p>
        </div>

        {/* Post Image - Only for organization */}
        {isOrganization && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Ảnh đại diện dự án <span className="text-red-500">*</span>
            </Label>
            <div className="mt-2 max-w-md mx-auto">
              {postImagePreview ? (
                <div className="relative inline-block w-full aspect-square">
                  <img
                    src={postImagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removePostImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <CloudUpload className="w-16 h-16 text-gray-400 mb-3" />
                  <span className="text-sm font-medium text-gray-700 mb-1">
                    Nhấp để chọn ảnh đại diện
                  </span>
                  <span className="text-xs text-gray-500">PNG, JPG - Tối đa 5MB</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handlePostImageChange}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Ảnh này sẽ hiển thị làm ảnh đại diện cho dự án của bạn
            </p>
          </div>
        )}

        {/* Description Images - For both account types */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Ảnh mô tả dự án <span className="text-gray-400">(Tối đa 5 ảnh)</span>
          </Label>
          <div className="mt-2 space-y-3">
            {descriptionImagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {descriptionImagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeDescriptionImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {descriptionImages.length < 5 && (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 bg-gray-50 hover:bg-gray-100 transition-colors">
                <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-700 mb-1">
                  Thêm ảnh mô tả ({descriptionImages.length}/5)
                </span>
                <span className="text-xs text-gray-500">PNG, JPG - Tối đa 5MB/ảnh</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,image/jpg"
                  multiple
                  onChange={handleDescriptionImagesChange}
                />
              </label>
            )}
          </div>
          {!isOrganization && (
            <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
              💡 <strong>Lưu ý:</strong> Ảnh đại diện dự án sẽ tự động sử dụng avatar của bạn
            </p>
          )}
          <p className="text-xs text-gray-500">
            Thêm các ảnh mô tả chi tiết về dự án, sản phẩm hoặc dịch vụ của bạn
          </p>
        </div>

        <div className="pt-4 flex justify-center lg:justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full lg:w-auto px-8",
              "bg-primary-bold hover:bg-primary-bold/90",
              {
                "opacity-50 cursor-not-allowed": isLoading,
              }
            )}
          >
            {isLoading 
              ? (isEditMode ? "Đang cập nhật..." : "Đang đăng bài...") 
              : (isEditMode ? "Cập nhật dự án" : "Đăng bài")
            }
          </Button>
        </div>
      </form>
    </div>
  );
}
