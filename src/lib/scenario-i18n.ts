import type { Locale } from "@/lib/i18n";
import type { Scenario } from "@/lib/types";

export interface ScenarioLocaleContent {
  title: string;
  description: string;
  aiRole: string;
  openingTranslation: string;
}

const SCENARIO_LOCALES: Record<string, Record<Locale, ScenarioLocaleContent>> = {
  restaurant: {
    en: {
      title: "Restaurant Order",
      description: "Practice ordering food at a Japanese restaurant.",
      aiRole: "Restaurant server",
      openingTranslation: "Welcome. Have you decided what you would like to order?",
    },
    vi: {
      title: "Gọi món tại nhà hàng",
      description: "Luyện gọi món tại nhà hàng Nhật Bản.",
      aiRole: "Nhân viên phục vụ",
      openingTranslation: "Xin chào. Bạn đã quyết định gọi món gì chưa?",
    },
  },
  "convenience-store": {
    en: {
      title: "Convenience Store",
      description: "Buy items and handle simple requests at a konbini.",
      aiRole: "Store clerk",
      openingTranslation: "Welcome. Would you like your bento heated?",
    },
    vi: {
      title: "Cửa hàng tiện lợi",
      description: "Mua hàng và xử lý yêu cầu đơn giản tại cửa hàng tiện lợi.",
      aiRole: "Nhân viên cửa hàng",
      openingTranslation: "Xin chào. Bạn có muốn hâm nóng cơm hộp không?",
    },
  },
  directions: {
    en: {
      title: "Asking Directions",
      description: "Ask for and understand directions in the city.",
      aiRole: "Passerby",
      openingTranslation: "Excuse me, is something troubling you?",
    },
    vi: {
      title: "Hỏi đường",
      description: "Hỏi và hiểu chỉ đường trong thành phố.",
      aiRole: "Người đi đường",
      openingTranslation: "Xin lỗi, bạn có cần giúp gì không?",
    },
  },
  "self-intro": {
    en: {
      title: "Self Introduction",
      description: "Introduce yourself in a casual social setting.",
      aiRole: "New acquaintance",
      openingTranslation: "Nice to meet you. What is your name?",
    },
    vi: {
      title: "Giới thiệu bản thân",
      description: "Giới thiệu bản thân trong môi trường xã giao thân mật.",
      aiRole: "Người quen mới",
      openingTranslation: "Rất vui được gặp bạn. Bạn tên gì?",
    },
  },
  hospital: {
    en: {
      title: "Hospital Visit",
      description: "Describe symptoms and communicate at a clinic.",
      aiRole: "Receptionist",
      openingTranslation: "Please wait. What brings you in today?",
    },
    vi: {
      title: "Khám bệnh",
      description: "Mô tả triệu chứng và giao tiếp tại phòng khám.",
      aiRole: "Lễ tân",
      openingTranslation: "Xin chờ. Hôm nay bạn đến vì lý do gì?",
    },
  },
  apartment: {
    en: {
      title: "Apartment Rental",
      description: "Inquire about renting an apartment in Japan.",
      aiRole: "Real estate agent",
      openingTranslation: "Welcome. Could you tell me your preferred conditions?",
    },
    vi: {
      title: "Thuê căn hộ",
      description: "Hỏi về thuê căn hộ tại Nhật Bản.",
      aiRole: "Nhân viên bất động sản",
      openingTranslation: "Xin chào. Bạn có thể cho biết điều kiện mong muốn không?",
    },
  },
  "request-leave": {
    en: {
      title: "Requesting Time Off",
      description: "Request leave from your manager politely.",
      aiRole: "Manager",
      openingTranslation: "Good work today. Is there something you need?",
    },
    vi: {
      title: "Xin nghỉ phép",
      description: "Xin nghỉ phép với sếp một cách lịch sự.",
      aiRole: "Quản lý",
      openingTranslation: "Hôm nay làm việc vất vả. Bạn cần gì không?",
    },
  },
  "workplace-meeting": {
    en: {
      title: "Team Meeting",
      description: "Participate in a workplace team discussion.",
      aiRole: "Team lead",
      openingTranslation: "Let's share this week's progress.",
    },
    vi: {
      title: "Họp nhóm",
      description: "Tham gia thảo luận nhóm tại nơi làm việc.",
      aiRole: "Trưởng nhóm",
      openingTranslation: "Hãy chia sẻ tiến độ tuần này.",
    },
  },
  "phone-call": {
    en: {
      title: "Phone Conversation",
      description: "Handle a professional phone call at work.",
      aiRole: "Client",
      openingTranslation: "Thank you for your continued support. I'm calling about the documents.",
    },
    vi: {
      title: "Điện thoại công việc",
      description: "Xử lý cuộc gọi điện thoại chuyên nghiệp tại nơi làm việc.",
      aiRole: "Khách hàng",
      openingTranslation: "Cảm ơn sự hỗ trợ của quý công ty. Tôi gọi về vấn đề tài liệu.",
    },
  },
  "school-admin": {
    en: {
      title: "School Administration",
      description: "Speak with school staff about enrollment or schedules.",
      aiRole: "School administrator",
      openingTranslation: "Welcome. How may I help you?",
    },
    vi: {
      title: "Văn phòng trường",
      description: "Nói chuyện với nhân viên trường về đăng ký hoặc lịch học.",
      aiRole: "Nhân viên hành chính",
      openingTranslation: "Xin chào. Tôi có thể giúp gì cho bạn?",
    },
  },
  classroom: {
    en: {
      title: "Classroom Discussion",
      description: "Participate in a classroom Q&A session.",
      aiRole: "Professor",
      openingTranslation: "Does anyone have an opinion on this question?",
    },
    vi: {
      title: "Thảo luận trong lớp",
      description: "Tham gia hỏi đáp trong lớp học.",
      aiRole: "Giáo sư",
      openingTranslation: "Có ai có ý kiến về câu hỏi này không?",
    },
  },
  "job-interview": {
    en: {
      title: "Job Interview",
      description: "Answer common interview questions in formal Japanese.",
      aiRole: "Interviewer",
      openingTranslation: "Thank you for your time today. Please start with a self-introduction.",
    },
    vi: {
      title: "Phỏng vấn việc làm",
      description: "Trả lời câu hỏi phỏng vấn phổ biến bằng tiếng Nhật trang trọng.",
      aiRole: "Người phỏng vấn",
      openingTranslation: "Cảm ơn bạn đã dành thời gian hôm nay. Xin hãy giới thiệu bản thân trước.",
    },
  },
  "business-meeting": {
    en: {
      title: "Business Meeting",
      description: "Negotiate and present ideas in a business setting.",
      aiRole: "Business client",
      openingTranslation: "Please tell us more about today's proposal.",
    },
    vi: {
      title: "Họp kinh doanh",
      description: "Đàm phán và trình bày ý tưởng trong môi trường kinh doanh.",
      aiRole: "Khách hàng doanh nghiệp",
      openingTranslation: "Xin hãy cho chúng tôi biết thêm về đề xuất hôm nay.",
    },
  },
  "customer-complaint": {
    en: {
      title: "Handling Complaints",
      description: "Resolve a customer complaint professionally.",
      aiRole: "Upset customer",
      openingTranslation: "The product I purchased recently has a defect. Please address this.",
    },
    vi: {
      title: "Xử lý khiếu nại",
      description: "Giải quyết khiếu nại khách hàng một cách chuyên nghiệp.",
      aiRole: "Khách hàng không hài lòng",
      openingTranslation: "Sản phẩm tôi mua gần đây bị lỗi. Xin hãy xử lý giúp.",
    },
  },
  supermarket: {
    en: { title: "Supermarket Shopping", description: "Ask for help and make purchases at a supermarket.", aiRole: "Store staff", openingTranslation: "Welcome. Are you looking for something?" },
    vi: { title: "Mua sắm siêu thị", description: "Hỏi nhân viên và mua hàng tại siêu thị.", aiRole: "Nhân viên cửa hàng", openingTranslation: "Xin chào. Bạn đang tìm gì ạ?" },
  },
  bank: {
    en: { title: "Bank Visit", description: "Open an account or handle banking tasks in Japanese.", aiRole: "Bank teller", openingTranslation: "Welcome. How may I help you today?" },
    vi: { title: "Giao dịch ngân hàng", description: "Mở tài khoản hoặc làm thủ tục ngân hàng bằng tiếng Nhật.", aiRole: "Nhân viên ngân hàng", openingTranslation: "Xin chào. Hôm nay tôi có thể giúp gì?" },
  },
  "post-office": {
    en: { title: "Post Office", description: "Send a package or mail at the post office.", aiRole: "Postal clerk", openingTranslation: "Welcome. What can I do for you?" },
    vi: { title: "Bưu điện", description: "Gửi bưu kiện hoặc thư tại bưu điện.", aiRole: "Nhân viên bưu điện", openingTranslation: "Xin chào. Tôi có thể giúp gì?" },
  },
  "train-station": {
    en: { title: "Public Transportation", description: "Buy tickets and ask about trains or buses.", aiRole: "Station staff", openingTranslation: "Excuse me, where are you headed?" },
    vi: { title: "Giao thông công cộng", description: "Mua vé và hỏi về tàu hoặc xe buýt.", aiRole: "Nhân viên nhà ga", openingTranslation: "Xin lỗi, bạn đi đến đâu?" },
  },
  "daily-report": {
    en: { title: "Daily Reporting", description: "Give a daily work report to your manager.", aiRole: "Manager", openingTranslation: "Good morning. Please tell me today's plan." },
    vi: { title: "Báo cáo hàng ngày", description: "Báo cáo công việc hàng ngày với sếp.", aiRole: "Quản lý", openingTranslation: "Chào buổi sáng. Hãy cho biết kế hoạch hôm nay." },
  },
  "ask-question": {
    en: { title: "Asking Questions at Work", description: "Ask a senior colleague for help at work.", aiRole: "Senior colleague", openingTranslation: "If anything is unclear, please ask." },
    vi: { title: "Hỏi đồng nghiệp", description: "Hỏi đồng nghiệp cấp trên tại nơi làm việc.", aiRole: "Đồng nghiệp cấp trên", openingTranslation: "Nếu có gì chưa rõ, cứ hỏi nhé." },
  },
  dormitory: {
    en: { title: "Dormitory Life", description: "Talk with dorm staff about room issues or rules.", aiRole: "Dormitory manager", openingTranslation: "What's the matter? Is something troubling you?" },
    vi: { title: "Cuộc sống ký túc xá", description: "Nói chuyện với quản lý ký túc xá về phòng hoặc nội quy.", aiRole: "Quản lý ký túc xá", openingTranslation: "Sao vậy? Có chuyện gì khó khăn không?" },
  },
  "club-activities": {
    en: { title: "Club Activities", description: "Join a school club and talk with members.", aiRole: "Club senior member", openingTranslation: "Nice to meet you. You're interested in our club?" },
    vi: { title: "Hoạt động câu lạc bộ", description: "Tham gia câu lạc bộ và nói chuyện với thành viên.", aiRole: "Thành viên câu lạc bộ", openingTranslation: "Rất vui được gặp bạn. Bạn quan tâm đến câu lạc bộ?" },
  },
  "meeting-classmates": {
    en: { title: "Meeting Classmates", description: "Make friends and chat with classmates.", aiRole: "Classmate", openingTranslation: "Hey, want to have lunch together?" },
    vi: { title: "Gặp bạn cùng lớp", description: "Kết bạn và trò chuyện với bạn cùng lớp.", aiRole: "Bạn cùng lớp", openingTranslation: "Này, ăn trưa cùng không?" },
  },
  "guide-customer": {
    en: { title: "Guiding Customers", description: "Help and guide customers in a store or facility.", aiRole: "Customer", openingTranslation: "Excuse me, where is the restroom?" },
    vi: { title: "Hướng dẫn khách hàng", description: "Giúp và hướng dẫn khách hàng tại cửa hàng.", aiRole: "Khách hàng", openingTranslation: "Xin lỗi, nhà vệ sinh ở đâu?" },
  },
  "interview-strengths": {
    en: { title: "Interview: Strengths", description: "Discuss your strengths and weaknesses in an interview.", aiRole: "Interviewer", openingTranslation: "Please tell us about your strengths and weaknesses." },
    vi: { title: "Phỏng vấn: Điểm mạnh/yếu", description: "Thảo luận điểm mạnh và điểm yếu trong phỏng vấn.", aiRole: "Người phỏng vấn", openingTranslation: "Xin hãy cho biết điểm mạnh và điểm yếu của bạn." },
  },
  "business-email": {
    en: { title: "Business Email", description: "Write and discuss professional emails in Japanese.", aiRole: "Email recipient", openingTranslation: "I read your email the other day. Let me confirm the details." },
    vi: { title: "Email kinh doanh", description: "Viết và thảo luận email chuyên nghiệp bằng tiếng Nhật.", aiRole: "Người nhận email", openingTranslation: "Tôi đã đọc email của bạn hôm trước. Xin cho tôi xác nhận chi tiết." },
  },
  "client-presentation": {
    en: { title: "Client Presentation", description: "Present proposals to a business client formally.", aiRole: "Executive client", openingTranslation: "Please start with an overview of today's proposal." },
    vi: { title: "Thuyết trình khách hàng", description: "Trình bày đề xuất cho khách hàng doanh nghiệp một cách trang trọng.", aiRole: "Khách hàng điều hành", openingTranslation: "Xin hãy bắt đầu với tổng quan đề xuất hôm nay." },
  },
  "keigo-practice": {
    en: { title: "Keigo Practice", description: "Practice respectful and humble language with a senior executive.", aiRole: "Executive client", openingTranslation: "Thank you for your time despite your busy schedule." },
    vi: { title: "Luyện kính ngữ", description: "Luyện ngôn ngữ kính trọng và khiêm nhường với lãnh đạo cấp cao.", aiRole: "Khách hàng điều hành", openingTranslation: "Cảm ơn bạn đã dành thời gian dù bận rộn." },
  },
  "office-etiquette": {
    en: { title: "Office Etiquette", description: "Navigate office customs, greetings, and polite exchanges.", aiRole: "HR manager", openingTranslation: "You're the new project member. Pleased to work with you." },
    vi: { title: "Nghi thức văn phòng", description: "Làm quen phong tục, chào hỏi và giao tiếp lịch sự tại văn phòng.", aiRole: "Quản lý nhân sự", openingTranslation: "Bạn là thành viên mới của dự án. Rất vui được hợp tác." },
  },
  "salary-negotiation": {
    en: { title: "Salary Negotiation", description: "Discuss compensation professionally with HR.", aiRole: "HR manager", openingTranslation: "This is about salary. Please share your current thinking." },
    vi: { title: "Đàm phán lương", description: "Thảo luận lương bổng chuyên nghiệp với nhân sự.", aiRole: "Quản lý nhân sự", openingTranslation: "Đây là về lương. Xin chia sẻ suy nghĩ hiện tại của bạn." },
  },
  "project-meeting": {
    en: { title: "Project Kickoff", description: "Lead or participate in a formal project kickoff meeting.", aiRole: "Meeting facilitator", openingTranslation: "Let us begin the kickoff meeting." },
    vi: { title: "Khởi động dự án", description: "Dẫn dắt hoặc tham gia cuộc họp khởi động dự án trang trọng.", aiRole: "Người điều phối họp", openingTranslation: "Chúng ta bắt đầu cuộc họp khởi động." },
  },
  pharmacy: {
    en: { title: "Pharmacy Visit", description: "Describe symptoms and ask for medicine at a pharmacy.", aiRole: "Pharmacist", openingTranslation: "Welcome. What symptoms are you experiencing?" },
    vi: { title: "Nhà thuốc", description: "Mô tả triệu chứng và hỏi thuốc tại nhà thuốc.", aiRole: "Dược sĩ", openingTranslation: "Xin chào. Bạn có triệu chứng gì?" },
  },
  "hair-salon": {
    en: { title: "Hair Salon", description: "Book a haircut and explain your preferred style.", aiRole: "Hair stylist", openingTranslation: "Welcome. What style would you like today?" },
    vi: { title: "Tiệm cắt tóc", description: "Đặt lịch cắt tóc và mô tả kiểu bạn muốn.", aiRole: "Thợ cắt tóc", openingTranslation: "Xin chào. Hôm nay bạn muốn kiểu gì?" },
  },
  "hotel-checkin": {
    en: { title: "Hotel Check-in", description: "Check in at a hotel and ask about amenities.", aiRole: "Hotel receptionist", openingTranslation: "Welcome. May I have the name on your reservation?" },
    vi: { title: "Check-in khách sạn", description: "Nhận phòng và hỏi về tiện ích tại khách sạn.", aiRole: "Lễ tân khách sạn", openingTranslation: "Xin chào. Xin cho biết tên đặt phòng?" },
  },
  izakaya: {
    en: { title: "Izakaya Order", description: "Order food and drinks at a casual Japanese pub.", aiRole: "Izakaya staff", openingTranslation: "Welcome. What would you like to drink?" },
    vi: { title: "Gọi món ở izakaya", description: "Gọi đồ ăn và thức uống tại quán izakaya.", aiRole: "Nhân viên izakaya", openingTranslation: "Xin chào. Bạn muốn uống gì?" },
  },
  library: {
    en: { title: "Library Visit", description: "Borrow books and ask about library services.", aiRole: "Librarian", openingTranslation: "Welcome. Are you looking for something?" },
    vi: { title: "Thư viện", description: "Mượn sách và hỏi dịch vụ thư viện.", aiRole: "Thủ thư", openingTranslation: "Xin chào. Bạn đang tìm gì?" },
  },
  "client-visit": {
    en: { title: "Client Site Visit", description: "Greet and present updates during a client office visit.", aiRole: "Client", openingTranslation: "We've been expecting you. Please share today's progress." },
    vi: { title: "Thăm khách hàng", description: "Chào hỏi và báo cáo tiến độ khi đến văn phòng khách hàng.", aiRole: "Khách hàng", openingTranslation: "Chúng tôi đã đợi bạn. Xin chia sẻ tiến độ hôm nay." },
  },
  "work-handover": {
    en: { title: "Work Handover", description: "Hand off tasks and explain status to a colleague.", aiRole: "Senior colleague", openingTranslation: "Please handle the handover. Can you tell me the current status?" },
    vi: { title: "Bàn giao công việc", description: "Bàn giao nhiệm vụ và giải thích tình trạng cho đồng nghiệp.", aiRole: "Đồng nghiệp cấp trên", openingTranslation: "Nhờ bạn bàn giao. Cho tôi biết tình hình hiện tại?" },
  },
  "part-time-interview": {
    en: { title: "Part-time Job Interview", description: "Interview for a part-time job as an international student.", aiRole: "Store manager", openingTranslation: "Thank you for coming today. How many days per week can you work?" },
    vi: { title: "Phỏng vấn việc làm thêm", description: "Phỏng vấn việc part-time với tư cách du học sinh.", aiRole: "Quản lý cửa hàng", openingTranslation: "Cảm ơn bạn đã đến. Bạn có thể làm mấy ngày một tuần?" },
  },
  "school-festival": {
    en: { title: "School Festival", description: "Welcome visitors and sell items at a school festival booth.", aiRole: "Festival visitor", openingTranslation: "Excuse me, what does this booth sell?" },
    vi: { title: "Lễ hội văn hóa", description: "Đón khách và bán hàng tại gian hàng lễ hội trường.", aiRole: "Khách tham quan", openingTranslation: "Xin lỗi, gian hàng này bán gì?" },
  },
  "career-goals": {
    en: { title: "Interview: Career Goals", description: "Explain your motivation and career goals in an interview.", aiRole: "Interviewer", openingTranslation: "Please tell us your motivation. Why did you choose our company?" },
    vi: { title: "Phỏng vấn: Mục tiêu nghề nghiệp", description: "Giải thích động lực và mục tiêu nghề nghiệp trong phỏng vấn.", aiRole: "Người phỏng vấn", openingTranslation: "Xin cho biết động lực. Tại sao bạn chọn công ty chúng tôi?" },
  },
  "previous-experience": {
    en: { title: "Interview: Work Experience", description: "Describe your previous work experience and responsibilities.", aiRole: "Interviewer", openingTranslation: "What kind of work did you handle at your previous job?" },
    vi: { title: "Phỏng vấn: Kinh nghiệm làm việc", description: "Mô tả kinh nghiệm và trách nhiệm công việc trước đây.", aiRole: "Người phỏng vấn", openingTranslation: "Ở công việc trước, bạn đảm nhận công việc gì?" },
  },
  "behavioral-question": {
    en: { title: "Interview: Behavioral", description: "Answer behavioral questions about teamwork and problem-solving.", aiRole: "Interviewer", openingTranslation: "Please tell us about a time your team faced a difficult challenge." },
    vi: { title: "Phỏng vấn: Hành vi", description: "Trả lời câu hỏi về làm việc nhóm và giải quyết vấn đề.", aiRole: "Người phỏng vấn", openingTranslation: "Hãy kể về lần nhóm bạn gặp thử thách khó khăn." },
  },
  "product-explanation": {
    en: { title: "Product Explanation", description: "Explain product features and answer customer questions.", aiRole: "Curious customer", openingTranslation: "Please explain this product in detail. Does it come with a warranty?" },
    vi: { title: "Giải thích sản phẩm", description: "Giải thích tính năng và trả lời câu hỏi khách hàng.", aiRole: "Khách hàng tò mò", openingTranslation: "Xin giải thích chi tiết sản phẩm này. Có bảo hành không?" },
  },
  "refund-request": {
    en: { title: "Refund Request", description: "Handle a customer requesting a refund professionally.", aiRole: "Upset customer", openingTranslation: "This product wasn't what I expected. I'd like a refund." },
    vi: { title: "Yêu cầu hoàn tiền", description: "Xử lý yêu cầu hoàn tiền của khách hàng chuyên nghiệp.", aiRole: "Khách hàng không hài lòng", openingTranslation: "Sản phẩm không như mong đợi. Tôi muốn hoàn tiền." },
  },
  "business-dinner": {
    en: { title: "Business Dinner", description: "Navigate formal toasts and conversation at a business dinner.", aiRole: "Executive client", openingTranslation: "Thank you for your time today. Let's start with a toast." },
    vi: { title: "Bữa ăn kinh doanh", description: "Giao tiếp và cụng ly trong bữa ăn kinh doanh trang trọng.", aiRole: "Khách hàng điều hành", openingTranslation: "Cảm ơn thời gian hôm nay. Chúng ta cụng ly trước nhé." },
  },
};

export function getLocalizedScenario(scenario: Scenario, locale: Locale) {
  const localized = SCENARIO_LOCALES[scenario.id]?.[locale];
  if (localized) return { ...scenario, ...localized };
  return scenario;
}

export function getOpeningTranslation(scenario: Scenario, locale: Locale): string {
  return SCENARIO_LOCALES[scenario.id]?.[locale]?.openingTranslation ?? scenario.openingTranslation;
}
