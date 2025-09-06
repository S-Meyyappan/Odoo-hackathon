import React, { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import Tagify from "@yaireo/tagify";
import "@yaireo/tagify/dist/tagify.css";

const Tags = forwardRef(({ value = "", settings = {}, onChange }, ref) => {
  const inputRef = useRef();
  const tagifyRef = useRef();

  useEffect(() => {
    // Initialize Tagify
    tagifyRef.current = new Tagify(inputRef.current, settings);

    // Bind change event
    tagifyRef.current.on("change", e => {
    if (onChange) {
      try {
        const parsed = JSON.parse(e.detail.value); // convert JSON string to array
        onChange(parsed);
      } catch {
        onChange([]); // fallback to empty array
      }
    }
  });


    // Cleanup
    return () => {
      tagifyRef.current.destroy();
    };
  }, [settings, onChange]);

  // Allow parent to access Tagify instance
  useImperativeHandle(ref, () => ({
    getTagify: () => tagifyRef.current
  }));

  return <input ref={inputRef} defaultValue={value} />;
});

export default Tags;
