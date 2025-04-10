import { Logos } from './Logos.jsx';

const lessonContent = [
  {
    type: 'paragraph',
    value: [
      "AI (Trí tuệ nhân tạo) là công nghệ giúp máy tính trở nên thông minh.",
      "Nó có thể học hỏi, nhận diện và suy nghĩ, mô phỏng cách mà con người chúng ta làm."
    ]
  },
  {
    type: 'paragraph',
    value: [
      "Các AI hiện đại có thể tạo ra nội dung như bài viết, hình ảnh, bài hát hay video, thậm chí lập trình phần mềm.",
      "Chúng cũng có thể trò chuyện, tìm kiếm và tạo báo cáo, và hỗ trợ chúng ta trong các công việc hàng ngày, như đặt phòng khách sạn hay sắp xếp lịch hẹn."
    ]
  },
  {
    type: 'paragraph',
    value: [
      "Cách sử dụng các AI phổ biến đều rất đơn giản.",
      "Bạn chỉ việc chat với chúng và đưa ra các yêu cầu.",
      "Chúng ta hãy cùng làm quen với các AI chatbot phổ biến qua một minigame nhé!"
    ]
  },
  {
    type: 'game',
    gameType: 'drag-drop',
    id: 'game-1',
    title: '✨ Kéo thả chatbot vào đúng công ty sản xuất',
    instruction: 'Bạn có biết các AI chatbot dưới đây không? Hãy kéo thả lần lượt vào công ty đã tạo ra chúng!',
    items: [
      { id: 'item-1', name: 'ChatGPT' },
      { id: 'item-2', name: 'Gemini' },
      { id: 'item-3', name: 'Grok' },
      { id: 'item-4', name: 'Claude' },
      { id: 'item-5', name: 'DeepSeek' },
      { id: 'item-6', name: 'Meta AI' },
      { id: 'item-7', name: 'Copilot' },
    ],
    categories: [
      { id: 'cat-1', name: 'OpenAI', logo: Logos.OpenAI },
      { id: 'cat-2', name: 'Google', logo: Logos.Google },
      { id: 'cat-3', name: 'xAI', logo: Logos.xAI},
      { id: 'cat-4', name: 'Anthropic', logo: Logos.Anthropic },
      { id: 'cat-5', name: 'DeepSeek', logo: Logos.DeepSeek },
      { id: 'cat-6', name: 'Meta', logo: Logos.Meta },
      { id: 'cat-7', name: 'Microsoft', logo: Logos.Microsoft },
    ],
    correctPairs: {
      'item-1': 'cat-1',
      'item-2': 'cat-2',
      'item-3': 'cat-3',
      'item-4': 'cat-4',
      'item-5': 'cat-5',
      'item-6': 'cat-6',
      'item-7': 'cat-7',
    }
  },
  { type: 'page-break', title: 'Làn sóng AI toàn cầu' },
  {
    type: 'paragraph',
    value: [
      "Hiện nay, AI đang bùng nổ trên toàn cầu, dẫn đầu là Mỹ với những tên tuổi lớn như NVidia và OpenAI.",
      "Trung Quốc đang vươn lên mạnh mẽ và có những sản phẩm gây chú ý như DeepSeek hay Manus.",
      "Trong khi đó, EU cũng có một vài startup AI đáng chú ý, như Mistral AI."
    ]
  },
  {
    type: 'image',
    src: '/map.png',
    alt: 'AI Centers of the World'
  },
  {
    type: 'highlight',
    title: '💡 Còn ở Việt Nam 🇻🇳 thì sao?',
    value: [
      "Từ năm 2025, lãnh đạo Việt Nam xác định khoa học công nghệ và đổi mới sáng tạo là một đột phá chiến lược.",
      "Trong đó, AI giữ vai trò then chốt.",
      "Song song đó, chính phủ cũng thúc đẩy các chương trình phổ cập kiến thức số và kỹ năng về AI cho toàn dân."
    ]
  },
  { 
    type: 'page-break', 
    title: 'Catch the AI Origin!' 
  },
  {
    type: 'game',
    gameType: 'catch-origin',
    title: 'Catch the AI Origin!',
    instruction: 'Di chuyển các giỏ để hứng. Đừng hứng sai giỏ!',
    winningThreshold: 14,
    baskets: ['Europe', 'USA', 'China'],
    basketIcons: {
      USA: '🇺🇸',
      Europe: '🇪🇺',
      China: '🇨🇳',
    },
    items: [
      { name: 'NVIDIA', basket: 'USA' },
      { name: 'OpenAI', basket: 'USA' },
      { name: 'Anthropic', basket: 'USA' },
      { name: 'Gemini', basket: 'USA' },
      { name: 'LLaMA', basket: 'USA' },
      { name: 'Runway', basket: 'USA' },
      { name: 'MidJourney', basket: 'USA' },
      { name: 'ElevenLabs', basket: 'USA' },
      { name: 'Mistral AI', basket: 'Europe' },
      { name: 'Stable Diffusion', basket: 'Europe' },
      { name: 'DeepSeek', basket: 'China' },
      { name: 'Manus', basket: 'China' },
      { name: 'Qwen', basket: 'China' },
      { name: 'Kling', basket: 'China' },
    ]
  },
  { type: 'page-break', title: 'Trắc nghiệm' },
  {
    type: 'quiz',
    title: 'Trắc nghiệm',
    questions: [
      {
        question: "Câu 1: AI hiện đại có thể làm gì trên thực tế?",
        options: [
          "A. Sinh ra nội dung",
          "B. Tìm và đặt phòng khách sạn",
          "C. Lập trình",
          "D. Tất cả các lựa chọn trên"
        ],
        answer: "D",
        explanation:
          "📝 Đáp án: D. AI có thể sinh nội dung như văn bản, hình ảnh, mã nguồn phần mềm. Các AI Agent như Operator hoặc Manus có thể giúp bạn đặt phòng, đặt bàn và thực hiện nhiều nhiệm vụ khác."
      },
      {
        question: "Câu 2: Đâu chưa phải là một trung tâm lớn về AI?",
        options: [
          "A. Trung Quốc",
          "B. Châu Âu",
          "C. Mỹ",
          "D. Nhật"
        ],
        answer: "D",
        explanation:
          "Đáp án: D. Nhật cũng có một số dự án AI đáng chú ý như Sakana AI. Tuy nhiên, so với Mỹ, Trung Quốc và Châu Âu thì Nhật vẫn chưa có các AI model hoặc sản phẩm gây tiếng vang và có ảnh hưởng lớn."
      }
    ]
  },
  { type: 'page-break', title: 'Tổng kết bài học' },
  {
    type: 'paragraph',
    value: [
      "Rất tốt. Bạn đã hoàn thành các bài trắc nghiệm và có hiểu biết ban đầu về AI.",
      "Ở bài tiếp theo, chúng ta sẽ tìm hiểu sâu hơn về AI tạo sinh."
    ]
  },
  {
    type: 'video',
    src: 'https://player.vimeo.com/video/946821430',
    title: 'Tổng kết bài học'
  },
  {
    type: 'paragraph',
    style: 'info',
    value: [
      "This is a sample clip for demo purpose."
    ]
  }
];

export default lessonContent;
