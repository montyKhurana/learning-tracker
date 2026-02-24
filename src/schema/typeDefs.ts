/**
 * GraphQL Type Definitions — Phase 2 (full schema)
 *
 * This defines the "shape" of your API — what clients can query and what data looks like.
 *
 * Key concepts:
 * - Types mirror your Prisma models, but they're NOT the same thing.
 *   Your DB schema is for storage; your GraphQL schema is for the API consumer.
 *   Example: The DB has a `courseTags` join table, but the API exposes a clean `tags` field.
 *
 * - `!` means non-nullable — GraphQL guarantees this field will never be null
 * - `[Topic!]!` means: the array itself is non-null AND each item is non-null
 *   (you'll always get an array, possibly empty, but never null items inside)
 *
 * - Enums restrict a field to specific values. GraphQL validates this automatically —
 *   if a client sends an invalid enum value, the request is rejected before your code runs.
 */

const typeDefs = `#graphql

  # ============================================================
  # ENUMS
  # These map directly to the Prisma enums in schema.prisma
  # ============================================================

  enum CourseStatus {
    NOT_STARTED
    IN_PROGRESS
    COMPLETED
  }

  enum TopicStatus {
    NOT_STARTED
    IN_PROGRESS
    COMPLETED
  }

  enum ResourceType {
    ARTICLE
    VIDEO
    DOCUMENTATION
    TUTORIAL
  }

  # ============================================================
  # TYPES — the shape of data returned by queries
  # ============================================================

  type User {
    id: ID!
    email: String!
    name: String!
    createdAt: String!
    updatedAt: String!
    courses: [Course!]!
  }

  type Course {
    id: ID!
    title: String!
    description: String
    status: CourseStatus!
    createdAt: String!
    updatedAt: String!
    user: User!
    topics: [Topic!]!
    tags: [Tag!]!
  }

  type Topic {
    id: ID!
    title: String!
    order: Int!
    status: TopicStatus!
    createdAt: String!
    updatedAt: String!
    course: Course!
    resources: [Resource!]!
    notes: [Note!]!
  }

  type Resource {
    id: ID!
    title: String!
    url: String!
    type: ResourceType!
    createdAt: String!
    updatedAt: String!
    topic: Topic!
  }

  type Note {
    id: ID!
    content: String!
    createdAt: String!
    updatedAt: String!
    topic: Topic!
  }

  type Tag {
    id: ID!
    name: String!
    courses: [Course!]!
  }

  # ============================================================
  # QUERIES — how clients read data
  # ============================================================

  type Query {
    hello: String

    # User
    me: User                        # Returns the logged-in user (Phase 4, returns null for now)

    # Courses
    courses: [Course!]!             # All courses (will be scoped to user in Phase 4)
    course(id: ID!): Course         # Single course by ID (nullable — returns null if not found)

    # Topics
    topic(id: ID!): Topic           # Single topic by ID

    # Tags
    tags: [Tag!]!                   # All tags
  }

  # ============================================================
  # INPUT TYPES — the shape of data sent BY the client
  #
  # Why separate from regular types?
  # - Regular types (Course) describe what the SERVER returns (can have resolvers)
  # - Input types (CreateCourseInput) describe what the CLIENT sends (just plain data)
  # - You don't send an "id" or "createdAt" when creating — the server generates those
  #
  # Why separate Create vs Update inputs?
  # - Create: required fields must be provided (title is mandatory)
  # - Update: everything is optional (you might only want to change the status)
  # ============================================================

  # --- Auth Types ---
  # AuthPayload returns both the token AND the user.
  # This way, after signup/login, the client has everything it needs:
  # - The token to store and send with future requests
  # - The user data to display immediately (no second query needed)
  type AuthPayload {
    token: String!
    user: User!
  }

  # --- Auth Inputs ---
  input SignupInput {
    email: String!
    password: String!
    name: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  # --- Course Inputs ---
  input CreateCourseInput {
    title: String!
    description: String
  }

  input UpdateCourseInput {
    title: String
    description: String
    status: CourseStatus
  }

  # --- Topic Inputs ---
  input CreateTopicInput {
    courseId: ID!
    title: String!
    order: Int
  }

  input UpdateTopicInput {
    title: String
    order: Int
    status: TopicStatus
  }

  # --- Resource Inputs ---
  input CreateResourceInput {
    topicId: ID!
    title: String!
    url: String!
    type: ResourceType
  }

  input UpdateResourceInput {
    title: String
    url: String
    type: ResourceType
  }

  # --- Note Inputs ---
  input CreateNoteInput {
    topicId: ID!
    content: String!
  }

  input UpdateNoteInput {
    content: String!
  }

  # ============================================================
  # MUTATIONS — how clients write data (create, update, delete)
  #
  # Convention: mutations return the affected object so the client
  # can update its UI without making a second query.
  # e.g. createCourse returns the new Course with its generated id.
  # ============================================================

  type Mutation {
    # --- Auth ---
    signup(input: SignupInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # --- Course ---
    createCourse(input: CreateCourseInput!): Course!
    updateCourse(id: ID!, input: UpdateCourseInput!): Course!
    deleteCourse(id: ID!): Course!

    # --- Topic ---
    createTopic(input: CreateTopicInput!): Topic!
    updateTopic(id: ID!, input: UpdateTopicInput!): Topic!
    deleteTopic(id: ID!): Topic!

    # --- Resource ---
    createResource(input: CreateResourceInput!): Resource!
    updateResource(id: ID!, input: UpdateResourceInput!): Resource!
    deleteResource(id: ID!): Resource!

    # --- Note ---
    createNote(input: CreateNoteInput!): Note!
    updateNote(id: ID!, input: UpdateNoteInput!): Note!
    deleteNote(id: ID!): Note!

    # --- Tag ---
    addTagToCourse(courseId: ID!, tagName: String!): Course!
    removeTagFromCourse(courseId: ID!, tagId: ID!): Course!
  }
`;

export default typeDefs;
