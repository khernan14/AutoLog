import React, { useRef } from "react";
import { Box, Button, IconButton } from "@mui/joy";
import ImageIcon from "@mui/icons-material/Image";
import DeleteIcon from "@mui/icons-material/Delete";
import SvgIcon from "@mui/joy/SvgIcon";
import { styled } from "@mui/joy";

const VisuallyHiddenInput = styled("input")`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

export default function UploadImages({ images, setImages }) {
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const previewImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...previewImages]);
  };

  const handleRemoveImage = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* <Button
        startDecorator={<ImageIcon />}
        onClick={() => fileInputRef.current.click()}>
        Subir imágenes
      </Button> */}
      <Button
        component="label"
        role={undefined}
        tabIndex={-1}
        variant="solid"
        color="primary"
        startDecorator={
          <SvgIcon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
              />
            </svg>
          </SvgIcon>
        }>
        Upload a file
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleFileChange}
        />
      </Button>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
        {images.map((img, index) => (
          <Box
            key={index}
            sx={{
              position: "relative",
              width: 100,
              height: 100,
              borderRadius: "md",
              overflow: "hidden",
              boxShadow: "sm",
            }}>
            <img
              src={img.url}
              alt={`preview-${index}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <IconButton
              size="sm"
              variant="soft"
              color="danger"
              onClick={() => handleRemoveImage(index)}
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                zIndex: 1,
              }}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
