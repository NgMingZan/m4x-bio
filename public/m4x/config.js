(function(){
  const KEY='m4x_site_config_v1';
  const defaults={
    profile:{name:'Nguyễn Minh Dân',bio:'Developer & SysAdmin. Chuyên Giao diện HyperOS, PLC Automation và AI Web Tools.',avatarText:'MD',avatarUrl:'',status:'SYSTEM_ONLINE'},
    socials:[{icon:'💻',label:'GitHub',url:'https://github.com/NgMingZan'},{icon:'✈️',label:'Telegram',url:'https://t.me/M4X_STORE_BOT'},{icon:'💬',label:'Zalo',url:'https://zalo.me/0123456789'}],
    theme:{accent:'#00f0ff',purple:'#7000ff',success:'#00cc66'},
    mhttps://youtu.be/Gl4w-l-lAH0'},
    bank:{bank:'VPBANK',account:'0123456789',name:'NGUYEN MINH DAN',qr:'https://via.placeholder.com/150?text=QR+VPBank'},
    products:[
      {title:'Tùy biến HyperOS / MIUI',price:'Liên hệ',desc:'Thiết kế theme độc quyền, can thiệp XML/Manifest, setup Dynamic Island.',icon:'🎨',image:''},
      {title:'Lập trình PLC Automation',price:'Liên hệ',desc:'Viết script GX Works2, điều khiển mạch khí nén, động cơ tuần tự.',icon:'⚙️',image:''},
      {title:'Source: AI Image Tools',price:'250K',desc:'Web App FastAPI xử lý ảnh: Tích hợp OCR và xóa vật thể (LaMa inpainting).',icon:'🤖',image:''},
      {title:'M4X Digital Pack',price:'49K',desc:'Trọn bộ dữ liệu lưu trữ, phần mềm tiện ích cao cấp từ M4X STORE.',icon:'📦',image:''}
    ]
  };
  window.M4X={KEY,defaults,get(){try{return {...structuredClone(defaults),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){return structuredClone(defaults)}},save(v){localStorage.setItem(KEY,JSON.stringify(v));},reset(){localStorage.removeItem(KEY)}};
})();
