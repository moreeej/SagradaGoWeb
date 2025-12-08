import { useState } from "react";
import { supabase } from "../../config/supabase";

export default function Testing() {
  const [file, setFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  async function handleUpload() {
    if (!file) {
      alert("Please select an image first");
      return;
    }

    console.log("file:", file);
    console.log("uploadedImageUrl:", uploadedImageUrl);
    

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;


    const { error } = await supabase.storage
      .from("wedding")
      .upload(filePath, file);

    if (error) {
      console.error("Upload error:", error);
      alert("Upload failed.");
      return;
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from("wedding")
      .getPublicUrl(filePath);

    setUploadedImageUrl(publicData.publicUrl);
    alert("Upload success!");
  }

  return (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload}>Upload</button>

      {uploadedImageUrl && (
        <div>
          <h3>Uploaded Image:</h3>
          <img src={uploadedImageUrl} alt="Uploaded" width={200} />
        </div>
      )}
    </>
  );
}
