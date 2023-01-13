interface Window {
  ethereum: any;
}

interface CourseDetail {
  courseId: number
  courseName: string
  courseFees: string
}

interface IDashboardProps {
  courses: Array<CourseDetail>
}
