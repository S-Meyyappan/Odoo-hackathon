import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { Listbox } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/solid";
import Tags from "../components/tags";

const API_URL = import.meta.env.VITE_API_URL;

function TaskForm() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId") || "";

  const [formData, setFormData] = useState({
    taskName: "",
    taskAssignees: [], // array of usernames
    projectId,
    taskTags: [],
    deadline: "",
    image: null,
    description: "",
  });

  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  // Fetch employees from backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`${API_URL}/users?role=employee`);
        setEmployees(res.data);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      }
    };
    fetchEmployees();
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
      const res = await axios.post(`${API_URL}/tasks`, data);
      return res.data;
    },
    onSuccess: () => {
      alert("Task created successfully");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageBase64 = "";
    if (formData.image) {
      imageBase64 = await fileToBase64(formData.image);
    }

    const tagValues = Array.isArray(formData.taskTags)
      ? formData.taskTags.map((tag) => tag.value || tag)
      : [];

    const assignees = selectedEmployees.map((emp) => emp.username);

    const payload = {
      ...formData,
      taskAssignees: assignees,
      taskTags: tagValues,
      image: imageBase64,
    };

    mutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Task Name */}
      <input
        type="text"
        name="taskName"
        placeholder="Task Name"
        value={formData.taskName}
        onChange={handleChange}
        required
        className="w-full rounded-md border px-3 py-2"
      />

      {/* Task Assignees Listbox (multi-select) */}
      <div>
        <Listbox
          value={selectedEmployees}
          onChange={(emps) => {
            setSelectedEmployees(emps);
          }}
          multiple
        >
          <div className="relative mt-1">
            <Listbox.Button className="w-full cursor-default rounded-md bg-gray-700 text-white py-2 px-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500">
              <span className="block truncate">
                {selectedEmployees.length > 0
                  ? selectedEmployees.map((e) => e.username).join(", ")
                  : "Select Employees"}
              </span>
            </Listbox.Button>

            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-700 py-1 shadow-lg ring-1 ring-black/20">
              {employees.map((emp) => (
                <Listbox.Option
                  key={emp._id}
                  value={emp}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                      active ? "bg-blue-500 text-white" : "text-white"
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
                        {emp.username}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                          <CheckIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>

      {/* Project ID (readonly) */}
      <input type="text" name="projectId" value={projectId} readOnly className="hidden" />

      {/* Task Tags */}
      <Tags
        name="taskTags"
        placeholder="Add task tags..."
        onChange={(newTags) =>
          setFormData((prev) => ({ ...prev, taskTags: newTags || [] }))
        }
      />

      {/* Deadline */}
      <input
        type="date"
        name="deadline"
        value={formData.deadline}
        onChange={handleChange}
        required
        className="w-full rounded-md border px-3 py-2"
      />

      {/* Image */}
      <input
        type="file"
        name="image"
        accept="image/*"
        onChange={handleChange}
        required
      />

      {/* Description */}
      <textarea
        name="description"
        placeholder="Task Description"
        value={formData.description}
        onChange={handleChange}
        required
        className="w-full rounded-md border px-3 py-2"
      ></textarea>

      {/* Submit */}
      <button
        type="submit"
        disabled={mutation.isLoading}
        className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {mutation.isLoading ? "Creating..." : "Create Task"}
      </button>
    </form>
  );
}

export default TaskForm;
