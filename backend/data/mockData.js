import mongoose from "mongoose";

const userIds = {
  Hima: new mongoose.Types.ObjectId("656d00000000000000000001"),
  Rinu: new mongoose.Types.ObjectId("656d00000000000000000002"),
  Saranya: new mongoose.Types.ObjectId("656d00000000000000000003"),
  Lanka: new mongoose.Types.ObjectId("656d00000000000000000004"),
  AdminNet: new mongoose.Types.ObjectId("656d00000000000000000005"), // fake admin — Internet
  SuperAdmin: new mongoose.Types.ObjectId("656d00000000000000000006"), // superadmin
};

export const mockUsers = [
  {
    _id: userIds.Hima,
    name: "Hima Prasobh",
    email: "hima23bcs86@iiitkottayam.ac.in",
    password: "password123",
    role: "student",
    room: "204",
    category: null,
    complaintsSubmitted: 5,
    status: "active",
  },
  {
    _id: userIds.Rinu,
    name: "Rinu Ann Varghese",
    email: "rinu23bcs29@iiitkottayam.ac.in",
    password: "password123",
    role: "student",
    room: "312",
    category: null,
    complaintsSubmitted: 3,
    status: "active",
  },
  {
    _id: userIds.Saranya,
    name: "Saranya K",
    email: "saranya23bcs179@iiitkottayam.ac.in",
    password: "password123",
    role: "student",
    room: "156",
    category: null,
    complaintsSubmitted: 2,
    status: "active",
  },
  {
    _id: userIds.Lanka,
    name: "Lanka Sruthi",
    email: "sruthi23bcd50@iiitkottayam.ac.in",
    password: "password123",
    role: "student",
    room: "118",
    category: null,
    complaintsSubmitted: 1,
    status: "active",
  },
  {
    _id: userIds.AdminNet,
    name: "Anil Menon",
    email: "anil.menon@iiitkottayam.ac.in",
    password: "password123",
    role: "admin",
    room: "-",
    category: "Internet",
    complaintsSubmitted: 0,
    status: "active",
  },
  {
    _id: userIds.SuperAdmin,
    name: "Super Admin",
    email: "superadmin@iiitkottayam.ac.in",
    password: "password123",
    role: "admin",
    room: "-",
    category: "SuperAdmin",
    complaintsSubmitted: 0,
    status: "active",
  },
];

const imagekitUrl =
  "https://ik.imagekit.io/uvzn5qbpl/andrea-davis-NngNVT74o6s-unsplash.jpg?updatedAt=1761052400439";

export const mockComplaints = [
  {
    _id: new mongoose.Types.ObjectId(),
    title: "Broken AC in Room 204",
    description:
      "The air conditioning unit in room 204 has been making loud noises and is not cooling properly. Please inspect and repair.",
    images: [imagekitUrl],
    status: "pending",
    votes: 2,
    votedBy: [userIds.Rinu, userIds.Lanka],
    submittedBy: userIds.Hima,
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    domain: "Maintenance",
    assignedTo: userIds.AdminNet,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: "Water Leakage in Bathroom",
    description:
      "There is continuous water leakage from the ceiling in the common bathroom on the 3rd floor. Needs plumber ASAP.",
    images: [imagekitUrl],
    status: "in-progress",
    votes: 3,
    votedBy: [userIds.Hima, userIds.Lanka, userIds.AdminNet],
    submittedBy: userIds.Rinu,
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    domain: "Maintenance",
    assignedTo: userIds.AdminNet,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: "Poor Food Quality in Mess",
    description:
      "The food served in the mess has been consistently poor quality for the past week. Requesting a review of vendors/menu.",
    images: [imagekitUrl],
    status: "resolved",
    votes: 5,
    votedBy: [
      userIds.Hima,
      userIds.Rinu,
      userIds.Saranya,
      userIds.AdminNet,
      userIds.SuperAdmin,
    ],
    submittedBy: userIds.Hima,
    submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    domain: "Food",
    assignedTo: userIds.SuperAdmin,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: "WiFi Connection Issues",
    description: "Internet connection has been very slow in block B and keeps disconnecting.",
    images: [imagekitUrl],
    status: "pending",
    votes: 1,
    votedBy: [userIds.Saranya],
    submittedBy: userIds.Lanka,
    submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    domain: "Internet",
    assignedTo: userIds.AdminNet,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: "Dirty Common Areas",
    description: "The common lounge and study areas are not being cleaned regularly; trash accumulates.",
    images: [imagekitUrl],
    status: "rejected",
    votes: 1,
    votedBy: [userIds.Rinu],
    submittedBy: userIds.Hima,
    submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    domain: "Cleanliness",
    assignedTo: null,
  },
];

export const mockNotifications = [
  // Hima Prasobh notifications
  {
    _id: new mongoose.Types.ObjectId(),
    userId: userIds.Hima,
    type: "success",
    title: "Complaint Resolved",
    message: 'Your complaint "Poor Food Quality in Mess" has been resolved.',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    isRead: false,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    userId: userIds.Hima,
    type: "info",
    title: "Status Update",
    message: 'Your complaint "Broken AC in Room 204" is now being processed by maintenance.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: false,
  },
  // Rinu notifications
  {
    _id: new mongoose.Types.ObjectId(),
    userId: userIds.Rinu,
    type: "warning",
    title: "Pending Review",
    message: "Your recent complaint requires additional information.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isRead: true,
  },
  // AdminNet notifications (admin)
  {
    _id: new mongoose.Types.ObjectId(),
    userId: userIds.AdminNet,
    type: "info",
    title: "New Assignment",
    message: "You have been assigned to handle maintenance and internet complaints.",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  // SuperAdmin notifications
  {
    _id: new mongoose.Types.ObjectId(),
    userId: userIds.SuperAdmin,
    type: "info",
    title: "System Notice",
    message: "SuperAdmin privileges have been granted.",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    isRead: false,
  },
];
