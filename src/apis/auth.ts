export const handleLogout = () => {
  if (typeof window !== 'undefined') {
    // 1. Xóa token cũ (nếu bạn lưu ở localStorage/sessionStorage)
    // localStorage.removeItem('accessToken'); 
    
    // 2. Lấy đường dẫn hiện tại để sau khi login xong thì quay lại
    const currentPath = window.location.pathname;
    
    // 3. Chặn vòng lặp: Nếu đang ở trang login rồi thì không redirect nữa
    if (currentPath === '/authentication') {
      return; 
    }

    // 4. Chuyển hướng kèm theo param ?next=...
    // encodeURIComponent để đảm bảo URL không bị lỗi ký tự đặc biệt
    window.location.href = `/authentication?next=${encodeURIComponent(currentPath)}`;
  }
};