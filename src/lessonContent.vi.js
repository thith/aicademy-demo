import { Logos } from './Logos.jsx';

const lessonContent = [
  { 
    type: 'page-break', 
    title: 'AI là gì?' 
  },
  {
    type: 'voiced-text',
    src: '/p1_vi.mp3',
    paragraphs: [
      { // Paragraph 1
        sentences: [
          {
            "text": "AI (Trí tuệ nhân tạo) là công nghệ giúp máy tính trở nên thông minh.",
            "char_timings": [
              0, 0.16, 0.32, 0.6, 0.635, 0.67, 0.705, 0.74, 0.787, 0.833, // indices 0-9
              0.88, 0.915, 0.95, 0.985, 1.02, 1.095, 1.17, 1.245, 1.32, 1.44, // indices 10-19
              1.56, 1.6, 1.64, 1.68, 1.72, 1.775, 1.83, 1.885, 1.94, 1.99, // indices 20-29
              2.04, 2.09, 2.14, 2.213, 2.287, 2.36, 2.4, 2.44, 2.48, 2.52, // indices 30-39
              2.587, 2.653, 2.72, 2.753, 2.787, 2.82, 2.864, 2.908, 2.952, 2.996, // indices 40-49
              3.04, 3.096, 3.152, 3.208, 3.264 // indices 50-55 - Still incomplete, but structure is updated
              // Missing timings for indices 56-67 (" thông minh.")
            ]
          },
          {
            "text": "Nó có thể học hỏi, nhận diện hình ảnh, và mô phỏng quá trình suy nghĩ của con người.",
            "char_timings": [
              3.76, 3.83, 3.9, 3.96, 4.02, 4.06, 4.1, 4.14, 4.2, 4.26, 4.32, 4.395, 4.47, 4.545, 4.94, 4.99, 5.04, 5.09, 5.14, 5.19, 5.24, 5.29, 5.34, 5.38, 5.42, 5.46, 5.5, 5.57, 5.64, 5.71, 5.78, 6, 6.22, 6.32, 6.42, 6.464, 6.508, 6.552, 6.596, 6.64, 6.687, 6.733, 6.78, 6.832, 6.884, 6.936, 6.988, 7.04, 7.147, 7.253, 7.36, 7.385, 7.41, 7.435, 7.46, 7.52, 7.58, 7.64, 7.707, 7.773, 7.84, 7.873, 7.907, 7.94, 7.973, 8.007
            ]
          }
        ]
      },
      { // Paragraph 2
        sentences: [
          {
            "text": "Các AI hiện đại có thể tạo ra nội dung đa dạng như bài viết, hình ảnh, bài hát, video, thậm chí lập trình phần mềm.",
            "char_timings": [
              9, 9.067, 9.133, 9.2, 9.34, 9.48, 9.52, 9.56, 9.6, 9.64, 9.713, 9.787, 9.86, 9.94, 10.02, 10.06, 10.1, 10.14, 10.213, 10.287, 10.36, 10.42, 10.48, 10.54, 10.6, 10.66, 10.715, 10.77, 10.825, 10.88, 11, 11.12, 11.19, 11.26, 11.33, 11.4, 11.433, 11.467, 11.5, 11.56, 11.62, 11.68, 11.744, 11.808, 11.872, 11.936, 12.18, 12.24, 12.3, 12.36, 12.42, 12.485, 12.55, 12.615, 12.9, 12.98, 13.06, 13.14, 13.215, 13.29, 13.365, 13.76, 13.813, 13.867, 13.92, 13.973, 14.027, 14.54, 14.6, 14.66, 14.72, 14.78, 14.84, 14.9, 14.96, 15.02, 15.08, 15.14, 15.18, 15.22, 15.26, 15.3, 15.34, 15.39, 15.44, 15.49, 15.54, 15.62, 15.7, 15.78
            ]
          },
          {
            "text": "Chúng cũng có thể trò chuyện, tra cứu thông tin, soạn báo cáo chi tiết, và hỗ trợ chúng ta trong các công việc hàng ngày, như đặt phòng khách sạn hay sắp xếp lịch hẹn.",
            "char_timings": [
              16.54, 16.576, 16.612, 16.648, 16.684, 16.72, 16.755, 16.79, 16.825, 16.86, 16.95, 17.04, 17.08, 17.12, 17.16, 17.247, 17.333, 17.42, 17.463, 17.506, 17.549, 17.591, 17.634, 17.677, 18.02, 18.08, 18.14, 18.2, 18.25, 18.3, 18.35, 18.4, 18.437, 18.473, 18.51, 18.547, 18.583, 18.62, 18.695, 18.77, 18.845, 19.26, 19.32, 19.38, 19.44, 19.493, 19.547, 19.6, 19.667, 19.733, 19.8, 19.853, 19.907, 19.96, 20.012, 20.064, 20.116, 20.168, 20.22, 20.47, 20.72, 20.81, 20.9, 20.96, 21.02, 21.08, 21.112, 21.144, 21.176, 21.208, 21.24, 21.35, 21.46, 21.504, 21.548, 21.592, 21.636, 21.68, 21.72, 21.76, 21.8, 21.84, 21.88, 21.92, 21.96, 21.995, 22.03, 22.065, 22.1, 22.15, 22.2, 22.25, 22.3, 22.344, 22.388, 22.432, 22.476, 23, 23.053, 23.107, 23.16, 23.2, 23.24, 23.28, 23.312, 23.344, 23.376, 23.408, 23.44, 23.476, 23.512, 23.548, 23.584, 23.62, 23.707, 23.793, 23.88, 23.947, 24.013, 24.08, 24.147, 24.213, 24.28, 24.347, 24.413, 24.48, 24.515, 24.55, 24.585, 24.62, 24.69, 24.76, 24.83
            ]
          }
        ]
      },
      { // Paragraph 3
        sentences: [
          {
            "text": "Cách sử dụng các AI phổ biến đều rất đơn giản.",
            "char_timings": [
              25.64, 25.685, 25.73, 25.775, 25.82, 25.92, 26.02, 26.065, 26.11, 26.155, 26.2, 26.233, 26.267, 26.3, 26.51, 26.72, 26.787, 26.853, 26.92, 26.97, 27.02, 27.07, 27.12, 27.187, 27.253, 27.32, 27.373, 27.427, 27.48, 27.54, 27.6, 27.66, 27.72, 27.78, 27.84, 27.9
            ]
          },
          {
            "text": "Bạn chỉ việc chat với chúng và đưa ra các yêu cầu.",
            "char_timings": [
              28.4, 28.453, 28.507, 28.56, 28.607, 28.653, 28.7, 28.74, 28.78, 28.82, 28.86, 28.915, 28.97, 29.025, 29.08, 29.12, 29.16, 29.2, 29.24, 29.28, 29.32, 29.36, 29.4, 29.64, 29.88, 29.933, 29.987, 30.04, 30.11, 30.18, 30.227, 30.273, 30.32, 30.393, 30.467, 30.54, 30.61, 30.68, 30.75
            ]
          },
          {
            "text": "Chúng ta hãy cùng làm quen với các AI chatbot phổ biến qua một minigame nhé!",
            "char_timings": [
              31.66, 31.692, 31.724, 31.756, 31.788, 31.82, 31.9, 31.98, 32.013, 32.047, 32.08, 32.12, 32.16, 32.2, 32.24, 32.293, 32.347, 32.4, 32.475, 32.55, 32.625, 32.7, 32.753, 32.807, 32.86, 32.9, 32.94, 32.98, 33.16, 33.34, 33.4, 33.46, 33.52, 33.58, 33.64, 33.7, 33.76, 33.833, 33.907, 33.98, 34.03, 34.08, 34.13, 34.18, 34.233, 34.287, 34.34, 34.393, 34.447, 34.5, 34.57, 34.64, 34.71, 34.78, 34.85, 34.92, 34.99, 35.06, 35.13, 35.2, 35.27
            ]
          }
        ]
      }
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
      { id: 'cat-3', name: 'xAI', logo: Logos.xAI },
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
      "Trung Quốc đang nổi lên như một đối thủ mạnh mẽ với những sản phẩm ấn tượng như DeepSeek và Manus.",
      "Trong khi đó, EU cũng có một vài startup AI đáng chú ý, như Mistral AI."
    ]
  },
  {
    type: 'image',
    src: '/map.png',
    alt: 'Các đầu tàu về AI trên thế giới',
    delay: 8
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
    title: 'Minigame: Hứng AI'
  },
  {
    type: 'game',
    gameType: 'catch-origin',
    title: 'Hứng AI Rơi',
    instruction: 'Di chuyển các giỏ để hứng. Đừng hứng sai giỏ nhé!',
    winningThreshold: 7,
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
    title: 'Quiz time!',
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
          "Đáp án: D. Nhật cũng có một số dự án AI đáng chú ý, như Sakana AI. Tuy nhiên, so với Mỹ, Trung Quốc và Châu Âu thì Nhật vẫn chưa có các mô hình hoặc sản phẩm AI tạo được tiếng vang và có ảnh hưởng lớn trên toàn cầu."
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
      "This is a sample video for demo purposes only."
    ]
  }
];

export default lessonContent;