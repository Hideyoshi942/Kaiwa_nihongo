export type StudyLocale = "en" | "vi";

type LocalizedText = Record<StudyLocale, string>;

export interface VerbFormLesson {
  id: string;
  shortLabel: LocalizedText;
  title: LocalizedText;
  level: string;
  formation: string;
  nuance: LocalizedText;
  whenToUse: LocalizedText;
  example: {
    japanese: string;
    romaji: string;
    translation: LocalizedText;
  };
  kaiwaTip: LocalizedText;
  exercise: {
    situation: LocalizedText;
    prompt: LocalizedText;
    target: LocalizedText;
  };
}

export const verbForms: VerbFormLesson[] = [
  {
    id: "masu",
    shortLabel: { vi: "ます形", en: "Masu" },
    title: { vi: "Thể lịch sự ます形", en: "Polite masu form" },
    level: "N5",
    formation: "食べる -> 食べます | 行く -> 行きます | する -> します",
    nuance: {
      vi: "Dạng mặc định khi nói lịch sự với người lạ, khách, giáo viên hoặc đồng nghiệp chưa thân.",
      en: "Your default polite register for strangers, customers, teachers, and less familiar coworkers.",
    },
    whenToUse: {
      vi: "Dùng để mở đầu hầu hết hội thoại đời sống thực trước khi bạn chuyển sang văn phong thân mật.",
      en: "Use it to start most real-life conversations before switching into casual speech.",
    },
    example: {
      japanese: "毎朝、日本語を勉強します。",
      romaji: "Maiasa, nihongo o benkyou shimasu.",
      translation: {
        vi: "Mỗi sáng tôi học tiếng Nhật.",
        en: "I study Japanese every morning.",
      },
    },
    kaiwaTip: {
      vi: "Trong kaiwa thực tế, nếu chưa chắc mức độ thân mật, cứ bắt đầu bằng です・ます rồi quan sát đối phương.",
      en: "In real conversation, start with です・ます when unsure about closeness, then adjust.",
    },
    exercise: {
      situation: {
        vi: "Bạn tự giới thiệu với giáo viên mới trong lớp trial.",
        en: "You introduce yourself to a new teacher in a trial class.",
      },
      prompt: {
        vi: "Nói 2 câu: tên bạn là gì và vì sao bạn học tiếng Nhật.",
        en: "Say two sentences: your name and why you study Japanese.",
      },
      target: {
        vi: "Dùng ít nhất 2 động từ ở ます形.",
        en: "Use at least two verbs in masu form.",
      },
    },
  },
  {
    id: "plain",
    shortLabel: { vi: "辞書形", en: "Plain" },
    title: { vi: "Thể từ điển / thể thường", en: "Dictionary / plain form" },
    level: "N5-N4",
    formation: "食べる | 行く | する",
    nuance: {
      vi: "Dùng với bạn bè, người thân, độc thoại nội tâm, hoặc khi nối vào nhiều mẫu ngữ pháp khác.",
      en: "Used with friends, family, inner thoughts, and as the base for many grammar patterns.",
    },
    whenToUse: {
      vi: "Cần nắm chắc để nói tự nhiên hơn trong kaiwa thân mật và để học các cấu trúc nâng cao.",
      en: "Essential for natural casual speech and for building more advanced grammar.",
    },
    example: {
      japanese: "今日、早く帰る。",
      romaji: "Kyou, hayaku kaeru.",
      translation: {
        vi: "Hôm nay mình về sớm.",
        en: "I'm going home early today.",
      },
    },
    kaiwaTip: {
      vi: "Sai phổ biến là trộn ます形 và thể thường trong cùng một lượt nói dù đang nói với bạn thân.",
      en: "A common mistake is mixing polite and plain forms in the same turn with close friends.",
    },
    exercise: {
      situation: {
        vi: "Bạn nhắn tin cho bạn thân rủ đi ăn ramen sau giờ học.",
        en: "You text a close friend to invite them for ramen after class.",
      },
      prompt: {
        vi: "Viết 2 câu ngắn bằng thể thường.",
        en: "Write two short lines in plain form.",
      },
      target: {
        vi: "Dùng một động từ hành động và một câu hỏi thân mật.",
        en: "Use one action verb and one casual question.",
      },
    },
  },
  {
    id: "te",
    shortLabel: { vi: "て形", en: "Te" },
    title: { vi: "Thể て形", en: "Te-form" },
    level: "N5-N4",
    formation: "食べて | 行って | して",
    nuance: {
      vi: "Thể nối câu cực quan trọng: yêu cầu, xin phép, hành động nối tiếp, mô tả trạng thái đang diễn ra.",
      en: "A core connector form for requests, permission, sequencing, and ongoing states.",
    },
    whenToUse: {
      vi: "Đây là thể xuất hiện dày đặc nhất trong hội thoại vì gần như mọi lời nhờ hoặc chỉ dẫn đều cần.",
      en: "This appears constantly in conversation because most requests and instructions depend on it.",
    },
    example: {
      japanese: "ちょっと待ってください。",
      romaji: "Chotto matte kudasai.",
      translation: {
        vi: "Xin hãy đợi một chút.",
        en: "Please wait a moment.",
      },
    },
    kaiwaTip: {
      vi: "Nếu làm dịch vụ hoặc văn phòng, hãy luyện cặp 〜てください và 〜てもいいですか trước vì dùng cực nhiều.",
      en: "For service or office situations, master 〜てください and 〜てもいいですか first.",
    },
    exercise: {
      situation: {
        vi: "Bạn đang ở quán cafe và muốn nhờ nhân viên đổi chỗ ngồi.",
        en: "You are at a cafe and want to ask staff to change your seat.",
      },
      prompt: {
        vi: "Tạo một câu xin phép và một câu nhờ vả.",
        en: "Create one permission question and one request.",
      },
      target: {
        vi: "Cả hai câu đều phải dùng て形.",
        en: "Both lines must use the te-form.",
      },
    },
  },
  {
    id: "ta",
    shortLabel: { vi: "た形", en: "Ta" },
    title: { vi: "Thể quá khứ た形", en: "Past ta-form" },
    level: "N5-N4",
    formation: "食べた | 行った | した",
    nuance: {
      vi: "Dùng để kể lại việc đã xảy ra, chia sẻ trải nghiệm hoặc xác nhận hành động đã hoàn tất.",
      en: "Used to describe completed actions, share experiences, and confirm finished tasks.",
    },
    whenToUse: {
      vi: "Cực hữu ích trong nói chuyện cuối ngày, review buổi họp, hoặc kể chuyện cuối tuần.",
      en: "Very useful in end-of-day chats, meeting recaps, and weekend storytelling.",
    },
    example: {
      japanese: "昨日、駅で山田さんに会った。",
      romaji: "Kinou, eki de Yamada-san ni atta.",
      translation: {
        vi: "Hôm qua tôi đã gặp anh/chị Yamada ở ga.",
        en: "Yesterday I met Yamada at the station.",
      },
    },
    kaiwaTip: {
      vi: "Khi phản xạ chậm, người học hay để nguyên dạng từ điển sau từ chỉ thời gian quá khứ. Hãy bắt cặp 昨日 / さっき với た形.",
      en: "Learners often forget to shift to past form after time words like yesterday. Drill them together.",
    },
    exercise: {
      situation: {
        vi: "Sếp hỏi hôm qua bạn đã làm gì cho khách hàng.",
        en: "Your manager asks what you did for a client yesterday.",
      },
      prompt: {
        vi: "Trả lời 3 mệnh đề ngắn về các việc đã hoàn thành.",
        en: "Reply with three short completed actions.",
      },
      target: {
        vi: "Dùng ít nhất một động từ する và một động từ di chuyển.",
        en: "Use at least one する verb and one movement verb.",
      },
    },
  },
  {
    id: "nai",
    shortLabel: { vi: "ない形", en: "Nai" },
    title: { vi: "Thể phủ định ない形", en: "Negative nai form" },
    level: "N5-N4",
    formation: "食べない | 行かない | しない",
    nuance: {
      vi: "Dùng để từ chối, phủ nhận, nói về việc không có kế hoạch làm gì, hoặc tạo ra các mẫu như 〜ないでください.",
      en: "Used for refusal, negation, lack of intention, and patterns like 〜ないでください.",
    },
    whenToUse: {
      vi: "Rất cần trong tình huống công việc khi bạn phải nói chưa làm, không thể làm, hoặc không nên làm.",
      en: "Important in workplace situations when you need to say you have not done, cannot do, or should not do something.",
    },
    example: {
      japanese: "今日は車を使わない。",
      romaji: "Kyou wa kuruma o tsukawanai.",
      translation: {
        vi: "Hôm nay tôi không dùng xe.",
        en: "I am not using the car today.",
      },
    },
    kaiwaTip: {
      vi: "Muốn từ chối mềm hơn trong kaiwa, đừng dừng ở ない. Hãy nối thêm んです, と思います, かもしれません.",
      en: "To soften a refusal, do not stop at ない. Add んです, と思います, or かもしれません.",
    },
    exercise: {
      situation: {
        vi: "Đồng nghiệp rủ tăng ca nhưng bạn đã có hẹn khám bệnh.",
        en: "A coworker asks you to stay late, but you already have a clinic appointment.",
      },
      prompt: {
        vi: "Từ chối lịch sự và nêu lý do ngắn.",
        en: "Decline politely and add a brief reason.",
      },
      target: {
        vi: "Có một động từ ở ない形.",
        en: "Include one verb in nai form.",
      },
    },
  },
  {
    id: "potential",
    shortLabel: { vi: "可能形", en: "Potential" },
    title: { vi: "Thể khả năng 可能形", en: "Potential form" },
    level: "N4",
    formation: "食べられる | 行ける | できる",
    nuance: {
      vi: "Diễn tả có thể làm được gì, rất hay dùng khi nói về năng lực, lịch trình, hoặc khả năng xử lý.",
      en: "Expresses ability or possibility, often used for skill, availability, and what you can handle.",
    },
    whenToUse: {
      vi: "Phù hợp trong phỏng vấn, báo cáo công việc, hoặc sắp xếp lịch gặp.",
      en: "Useful in interviews, work updates, and scheduling conversations.",
    },
    example: {
      japanese: "金曜日なら参加できます。",
      romaji: "Kinyoubi nara sanka dekimasu.",
      translation: {
        vi: "Nếu là thứ Sáu thì tôi có thể tham gia.",
        en: "If it is Friday, I can join.",
      },
    },
    kaiwaTip: {
      vi: "Trong công việc, できます thường nghe chủ động và đáng tin hơn là chỉ nói 大丈夫です.",
      en: "At work, できます often sounds more concrete and reliable than only saying 大丈夫です.",
    },
    exercise: {
      situation: {
        vi: "Khách hỏi bạn có thể giao tài liệu trước 5 giờ không.",
        en: "A client asks whether you can deliver the documents before 5 p.m.",
      },
      prompt: {
        vi: "Trả lời có thể hoặc không thể, rồi nói rõ thời điểm thay thế.",
        en: "Answer whether you can or cannot, then give an alternative time.",
      },
      target: {
        vi: "Dùng 1 câu với できます / できません.",
        en: "Use one sentence with できます or できません.",
      },
    },
  },
  {
    id: "volitional",
    shortLabel: { vi: "意向形", en: "Volitional" },
    title: { vi: "Thể ý chí / rủ rê", en: "Volitional form" },
    level: "N4",
    formation: "食べよう | 行こう | しよう",
    nuance: {
      vi: "Dùng để tự nhủ sẽ làm gì hoặc rủ người khác cùng làm một cách thân mật.",
      en: "Used for deciding to do something yourself or casually inviting others to do it together.",
    },
    whenToUse: {
      vi: "Tự nhiên trong hội thoại bạn bè, team nội bộ thân thiết, hoặc khi lên kế hoạch nhanh.",
      en: "Natural in friendly chats, close internal team talk, or quick planning.",
    },
    example: {
      japanese: "先に昼ご飯を食べよう。",
      romaji: "Saki ni hirugohan o tabeyou.",
      translation: {
        vi: "Mình ăn trưa trước nhé.",
        en: "Let's eat lunch first.",
      },
    },
    kaiwaTip: {
      vi: "Khi cần lịch sự hơn, thay 〜よう bằng 〜ましょう. Ý nghĩa gần nhau nhưng độ lịch sự khác hẳn.",
      en: "When you need more politeness, swap 〜よう for 〜ましょう.",
    },
    exercise: {
      situation: {
        vi: "Bạn và đồng đội vừa kết thúc họp online và muốn chốt bước tiếp theo.",
        en: "You and a teammate just finished an online meeting and want to set the next step.",
      },
      prompt: {
        vi: "Rủ đồng đội cùng kiểm tra lại file rồi gửi khách.",
        en: "Suggest checking the file together and then sending it to the client.",
      },
      target: {
        vi: "Dùng ít nhất một động từ ở 意向形 hoặc 〜ましょう.",
        en: "Use at least one volitional verb or 〜ましょう.",
      },
    },
  },
  {
    id: "imperative",
    shortLabel: { vi: "命令形", en: "Command" },
    title: { vi: "Thể mệnh lệnh và cấm đoán", en: "Imperative and prohibitive" },
    level: "N3",
    formation: "読め | 行け | するな | 入るな",
    nuance: {
      vi: "Rất mạnh. Trong đời sống thật thường thấy ở biển báo, thể thao, anime, hoặc cấp cứu; ít dùng trực tiếp với người khác.",
      en: "Very strong. Common in signs, sports, anime, and emergencies; rarely used directly in normal conversation.",
    },
    whenToUse: {
      vi: "Nên học để nghe hiểu và để chuyển sang dạng mềm hơn như 〜てください hoặc 〜ないでください.",
      en: "Learn it mostly for comprehension and for converting it into softer request forms.",
    },
    example: {
      japanese: "ここで写真を撮るな。",
      romaji: "Koko de shashin o toru na.",
      translation: {
        vi: "Không được chụp ảnh ở đây.",
        en: "Do not take photos here.",
      },
    },
    kaiwaTip: {
      vi: "Trong kaiwa thực tế, gần như luôn nên đổi mệnh lệnh thô sang lời nhờ lịch sự nếu bạn không ở tình huống khẩn cấp.",
      en: "In real conversation, convert raw commands into polite requests unless it is an emergency.",
    },
    exercise: {
      situation: {
        vi: "Bạn làm bảo tàng và cần nhắc khách không chạm vào hiện vật.",
        en: "You work at a museum and need to tell a visitor not to touch an exhibit.",
      },
      prompt: {
        vi: "Viết một câu biển báo mạnh và một câu nhắc lịch sự dùng trong nói chuyện.",
        en: "Write one strong sign version and one polite spoken version.",
      },
      target: {
        vi: "Phân biệt rõ cấm đoán cứng và cấm đoán mềm.",
        en: "Clearly separate hard prohibition from soft prohibition.",
      },
    },
  },
  {
    id: "passive",
    shortLabel: { vi: "受身形", en: "Passive" },
    title: { vi: "Thể bị động 受身形", en: "Passive form" },
    level: "N3",
    formation: "褒められる | 呼ばれる | 注意される",
    nuance: {
      vi: "Diễn tả bị tác động bởi người khác. Hay gặp trong báo cáo sự cố, phàn nàn, hoặc văn phong khách quan.",
      en: "Describes being affected by someone else. Common in incident reports, complaints, and neutral reporting.",
    },
    whenToUse: {
      vi: "Rất hữu ích khi kể lại việc mình được yêu cầu, bị nhắc, hoặc bị thay đổi lịch trình.",
      en: "Useful when reporting that you were asked, warned, or affected by a schedule change.",
    },
    example: {
      japanese: "会議で部長に質問された。",
      romaji: "Kaigi de buchou ni shitsumon sareta.",
      translation: {
        vi: "Trong cuộc họp tôi đã bị trưởng phòng hỏi.",
        en: "I was asked a question by the department manager in the meeting.",
      },
    },
    kaiwaTip: {
      vi: "Đừng lạm dụng bị động khi chủ ngữ là chính bạn và bạn chủ động làm việc; khi đó nên quay về chủ động để câu tự nhiên hơn.",
      en: "Do not overuse passive when you actively did the action yourself; active voice often sounds more natural.",
    },
    exercise: {
      situation: {
        vi: "Bạn giải thích với HR vì sao hôm nay vào muộn.",
        en: "You explain to HR why you arrived late today.",
      },
      prompt: {
        vi: "Nói rằng bạn bị khách giữ lại bằng một cuộc gọi khẩn.",
        en: "Say that a client kept you back with an urgent phone call.",
      },
      target: {
        vi: "Dùng ít nhất một động từ bị động.",
        en: "Use at least one passive verb.",
      },
    },
  },
  {
    id: "causative",
    shortLabel: { vi: "使役形", en: "Causative" },
    title: { vi: "Thể sai khiến 使役形", en: "Causative form" },
    level: "N3",
    formation: "食べさせる | 行かせる | させる",
    nuance: {
      vi: "Diễn tả bắt ai làm hoặc cho phép ai làm. Xuất hiện trong công việc, giáo dục, chăm sóc khách hàng.",
      en: "Expresses making someone do something or letting someone do it.",
    },
    whenToUse: {
      vi: "Cần khi nói về phân công nhiệm vụ, chính sách công ty, hoặc cha mẹ với con cái.",
      en: "Needed for task assignment, company policy, and parent-child situations.",
    },
    example: {
      japanese: "新人に資料を確認させます。",
      romaji: "Shinjin ni shiryou o kakunin sasemasu.",
      translation: {
        vi: "Tôi sẽ cho nhân viên mới kiểm tra tài liệu.",
        en: "I will have the new employee check the documents.",
      },
    },
    kaiwaTip: {
      vi: "Trong văn phòng, 〜させていただきます cũng rất hay gặp để diễn tả 'xin phép được làm'.",
      en: "In office Japanese, 〜させていただきます often appears to mean 'allow me to do'.",
    },
    exercise: {
      situation: {
        vi: "Bạn là trưởng nhóm và cần phân công intern cập nhật bảng dữ liệu.",
        en: "You are a team lead assigning an intern to update a data sheet.",
      },
      prompt: {
        vi: "Nói một câu giao việc và một câu giải thích lý do.",
        en: "Say one assignment sentence and one short reason.",
      },
      target: {
        vi: "Có một động từ ở thể sai khiến.",
        en: "Include one causative verb.",
      },
    },
  },
  {
    id: "causative-passive",
    shortLabel: { vi: "使役受身", en: "Caus-Pass" },
    title: { vi: "Thể sai khiến bị động", en: "Causative-passive form" },
    level: "N3-N2",
    formation: "食べさせられる | 行かされる | させられる",
    nuance: {
      vi: "Diễn tả bị ép phải làm gì. Thường mang sắc thái khó chịu, bất đắc dĩ hoặc áp lực.",
      en: "Describes being forced to do something, often with frustration or reluctance.",
    },
    whenToUse: {
      vi: "Hay gặp khi than phiền về quy định, deadline, hay việc phải làm ngoài ý muốn.",
      en: "Common when complaining about rules, deadlines, or unwanted obligations.",
    },
    example: {
      japanese: "昨日、残業させられました。",
      romaji: "Kinou, zangyou saseraremashita.",
      translation: {
        vi: "Hôm qua tôi bị ép tăng ca.",
        en: "Yesterday I was made to work overtime.",
      },
    },
    kaiwaTip: {
      vi: "Dạng này khá nặng. Với môi trường công sở, chỉ dùng khi thật sự muốn nhấn vào tính bị ép buộc.",
      en: "This form is strong. In the workplace, use it only when you truly want to stress coercion.",
    },
    exercise: {
      situation: {
        vi: "Bạn kể với bạn thân về việc bị đổi lịch nghỉ vào phút chót.",
        en: "You tell a close friend you were forced to change your day off at the last minute.",
      },
      prompt: {
        vi: "Nói 2 câu ngắn theo giọng than phiền tự nhiên.",
        en: "Say two short lines in a natural complaining tone.",
      },
      target: {
        vi: "Dùng một động từ ở thể sai khiến bị động.",
        en: "Use one causative-passive verb.",
      },
    },
  },
  {
    id: "conditional",
    shortLabel: { vi: "条件形", en: "Conditional" },
    title: { vi: "Các thể điều kiện たら・ば・なら", en: "Conditional forms たら・ば・なら" },
    level: "N4-N3",
    formation: "時間があったら | 安ければ | 週末なら",
    nuance: {
      vi: "Dùng để thương lượng, đề xuất phương án, nêu giả định và đưa lời khuyên.",
      en: "Used for negotiation, options, hypotheticals, and advice.",
    },
    whenToUse: {
      vi: "Đây là nhóm cực quan trọng trong sắp lịch, chốt meeting, hỏi giá, xin lời khuyên.",
      en: "This group is critical for scheduling, meetings, price questions, and asking for advice.",
    },
    example: {
      japanese: "問題があれば、すぐ連絡してください。",
      romaji: "Mondai ga areba, sugu renraku shite kudasai.",
      translation: {
        vi: "Nếu có vấn đề, hãy liên lạc ngay.",
        en: "If there is a problem, please contact me immediately.",
      },
    },
    kaiwaTip: {
      vi: "Trong công việc, 〜たら thường tự nhiên trong nói chuyện; 〜ば gọn và logic; 〜なら hợp khi phản hồi theo thông tin đối phương vừa nói.",
      en: "At work, 〜たら feels conversational, 〜ば feels concise and logical, and 〜なら reacts to the listener's situation.",
    },
    exercise: {
      situation: {
        vi: "Khách hỏi nếu giao chậm thì công ty bạn xử lý thế nào.",
        en: "A client asks what your company does if delivery is delayed.",
      },
      prompt: {
        vi: "Trả lời bằng 2 câu: một câu điều kiện và một câu hành động tiếp theo.",
        en: "Reply with two lines: one conditional and one follow-up action.",
      },
      target: {
        vi: "Dùng một trong ba mẫu たら・ば・なら.",
        en: "Use one of たら, ば, or なら.",
      },
    },
  },
];
