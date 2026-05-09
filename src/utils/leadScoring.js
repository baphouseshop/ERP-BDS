/**
 * Logic tính điểm Lead dựa trên các hoạt động
 * @param {Object} lead - Dữ liệu lead hiện tại
 * @param {Array} activities - Danh sách hoạt động (calls, meetings, messages)
 */
export const calculateLeadScore = (lead, activities = []) => {
  let score = 0;
  
  // 1. Dựa trên số lượng phản hồi (Response weight)
  const responses = activities.filter(a => a.type === 'response');
  score += responses.length * 15;
  
  // 2. Dựa trên cảm xúc (Sentiment weight)
  const positiveResponses = activities.filter(a => a.sentiment === 'positive');
  score += positiveResponses.length * 25;
  
  // 3. Dựa trên thời gian (Recency weight)
  const lastActive = activities.length > 0 ? new Date(activities[0].created_at) : new Date(lead.ngay_nhan);
  const daysSinceActive = (new Date() - lastActive) / (1000 * 60 * 60 * 24);
  
  if (daysSinceActive < 1) score += 20;
  else if (daysSinceActive < 3) score += 10;
  else if (daysSinceActive > 14) score -= 20;

  // Giới hạn 0 - 100
  const finalScore = Math.min(100, Math.max(0, score));
  
  // Phân loại Lạnh/Ấm/Nóng
  let label = 'lanh';
  if (finalScore >= 70) label = 'nong';
  else if (finalScore >= 30) label = 'am';
  
  return {
    score: finalScore,
    label: label
  };
};
