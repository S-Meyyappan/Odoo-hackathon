import { useState, useEffect } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Listbox } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/solid";
import Tags from "../components/tags";

const API_URL = import.meta.env.VITE_API_URL;

function ProjectForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    projectName: "",
    projectTags: [],
    projectManager: "",
    deadline: "",
    priority: "",
    image: null,
    description: "",
    tasks: [],
  });

  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);

  // Fetch managers from backend
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await axios.get(`${API_URL}/users?role=manager`);
        setManagers(res.data);
        if (res.data.length > 0) {
          setSelectedManager(res.data[0]);
          setFormData((prev) => ({ ...prev, projectManager: res.data.username }));
        }
      } catch (err) {
        console.error("Failed to fetch managers:", err);
      }
    };
    fetchManagers();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await axios.post(`${API_URL}/addprojects`, data);
      return res.data;
    },
    onSuccess: (newProject) => {
      navigate(`/task?projectId=${newProject._id}&projectName=${encodeURIComponent(newProject.projectName)}`);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageBase64 = "";
    if (formData.image) {
      imageBase64 = await fileToBase64(formData.image);
    }

    if (!formData.projectManager) {
        return alert("Please select a project manager!");
    }
    
    const tagValues = Array.isArray(formData.projectTags)
      ? formData.projectTags.map((tag) => tag.value || tag)
      : [];

    const payload = { ...formData, projectTags: tagValues, image: imageBase64 };
    mutation.mutate(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-6 bg-gray-900 rounded-xl shadow-md space-y-6"
    >
      <input
        type="text"
        name="projectName"
        placeholder="Project Name"
        value={formData.projectName}
        onChange={handleChange}
        required
        className="w-full rounded-md border border-gray-700 bg-gray-800 text-white px-3 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <Tags
        name="projectTags"
        placeholder="Add tags..."
        onChange={(newTags) =>
          setFormData((prev) => ({ ...prev, projectTags: newTags || [] }))
        }
      />

      {/* Manager Listbox */}
      <Listbox
        value={selectedManager}
        onChange={(manager) => {
            setSelectedManager(manager);
            setFormData((prev) => ({ ...prev, projectManager: manager.username }));
        }}
      >
        <div className="relative mt-1">
          <Listbox.Button className="w-full cursor-pointer rounded-md bg-gray-800 text-white py-2 px-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500">
            <span className="block truncate">
              {selectedManager ? selectedManager.username : "Select Manager"}
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 shadow-lg ring-1 ring-black/20 z-10">
            {managers.map((manager) => (
              <Listbox.Option
                key={manager._id}
                value={manager}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                    active ? "bg-blue-500 text-white" : "text-gray-200"
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? "font-semibold text-blue-400" : "font-normal"
                      }`}
                    >
                      {manager.username}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <CheckIcon
                          className="h-5 w-5 text-blue-400"
                          aria-hidden="true"
                        />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>

      <input
        type="date"
        name="deadline"
        value={formData.deadline}
        onChange={handleChange}
        required
        className="w-full rounded-md border border-gray-700 bg-gray-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex gap-4">
        {["low", "medium", "high"].map((level) => (
          <label key={level} className="flex items-center gap-1 text-gray-300">
            <input
              type="radio"
              name="priority"
              value={level}
              checked={formData.priority === level}
              onChange={handleChange}
            />
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </label>
        ))}
      </div>

      <input
        type="file"
        name="image"
        accept="image/*"
        onChange={handleChange}
        required
        className="w-full text-gray-200 file:bg-gray-700 file:text-white file:px-3 file:py-2 file:rounded-md file:border-none focus:outline-none"
      />

      <textarea
        name="description"
        placeholder="Project Description"
        value={formData.description}
        onChange={handleChange}
        required
        className="w-full rounded-md border border-gray-700 bg-gray-800 text-white px-3 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        rows={4}
      />

      <button
        type="submit"
        disabled={mutation.isLoading}
        className="w-full rounded-md bg-blue-600 hover:bg-blue-700 transition-colors text-white px-4 py-2 font-medium disabled:opacity-50"
      >
        {mutation.isLoading ? "Creating..." : "Create Project"}
      </button>
    </form>
  );
}

export default ProjectForm;
