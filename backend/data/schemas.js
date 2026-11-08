window.SECTION_SCHEMAS = {
            'header': {
                title: 'Cài đặt Header',
                desc: 'Chỉnh sửa Logo và Menu điều hướng ở đầu trang.',
                fields: [
                    { path: 'header.logo', label: 'Tên Logo (Chữ)', type: 'text' },
                    { path: 'header.home_link', label: 'Đường dẫn (Link) nút Trang chủ', type: 'text' },
                    { path: 'header.nav.0.label', label: 'Tên Menu 1 (VD: About Me)', type: 'text' },
                    { path: 'header.nav.0.href', label: 'Link Menu 1 (VD: #sec-about)', type: 'text' },
                    { path: 'header.nav.1.label', label: 'Tên Menu 2 (VD: Project)', type: 'text' },
                    { path: 'header.nav.1.href', label: 'Link Menu 2 (VD: #sec-projects)', type: 'text' },
                    { path: 'header.nav.2.label', label: 'Tên Menu 3 (VD: All Projects)', type: 'text' },
                    { path: 'header.nav.2.href', label: 'Link Menu 3 (VD: all-projects.html)', type: 'text' },
                    { path: 'header.nav.3.label', label: 'Tên Menu 4 (VD: Contact Me)', type: 'text' },
                    { path: 'header.nav.3.href', label: 'Link Menu 4 (VD: #sec-contact)', type: 'text' }
                ]
            },
            'cv': {
                title: 'Khu vực Hero',
                desc: 'Phần giới thiệu đầu tiên đập vào mắt người xem.',
                fields: [
                    { path: 'portfolio.cv.name', label: 'Tên hiển thị (HI, I\'m...)', type: 'text' },
                    { path: 'portfolio.cv.role', label: 'Chức danh (Graphic Designer...)', type: 'text' },
                    { path: 'portfolio.cv.location', label: 'Địa điểm (Based in...)', type: 'text' },
                    { path: 'portfolio.cv.intro', label: 'Đoạn mô tả ngắn', type: 'textarea' },
                    { path: 'portfolio.cv.hero_image', label: 'Ảnh minh họa', type: 'image' },
                    { path: 'portfolio.cv.facebook', label: 'Link Facebook (Hero)', type: 'text' },
                    { path: 'portfolio.cv.instagram', label: 'Link Instagram (Hero)', type: 'text' },
                    { path: 'portfolio.cv.behance_url', label: 'Link Behance (Hero)', type: 'text' },
                    { path: 'portfolio.cv.discord', label: 'Link Discord (Hero)', type: 'text' }
                ]
            },
            'cv.education': {
                title: 'Khu vực About (Về tôi)',
                desc: 'Giới thiệu chi tiết và các thông tin cá nhân.',
                fields: [
                    { path: 'portfolio.cv.avatar', label: 'Ảnh đại diện (Avatar)', type: 'image' },
                    { path: 'portfolio.cv.dob', label: 'Ngày sinh (DOB)', type: 'text' },
                    { path: 'portfolio.cv.phone', label: 'Số điện thoại', type: 'text' },
                    { path: 'portfolio.cv.email', label: 'Email', type: 'text' },
                    { path: 'portfolio.cv.behance', label: 'Link Behance', type: 'text' },
                    { path: 'portfolio.cv.intro2', label: 'Đoạn giới thiệu chi tiết', type: 'textarea' },
                    { path: 'portfolio.cv.education.school', label: 'Tên trường / Nơi đào tạo', type: 'text' },
                    { path: 'portfolio.cv.education.year', label: 'Thời gian học', type: 'text' },
                    { path: 'portfolio.cv.education.courses', label: 'Các khóa học / Môn học', type: 'array' },
                    { path: 'portfolio.cv.skills', label: 'Kỹ năng (Skills)', type: 'array' },
                    { path: 'portfolio.cv.software', label: 'Phần mềm (Mảng JSON)', type: 'json' },
                    { path: 'portfolio.cv.experiences', label: 'Kinh nghiệm (Mảng JSON)', type: 'json' }
                ]
            },
            'portfolio': {
                title: 'Khu vực Projects (Dự án)',
                desc: 'Quản lý danh sách các dự án hiển thị trên trang chủ và trang tất cả dự án.',
                fields: []
            },
            'testimonials': {
                title: 'Khu vực Testimonial',
                desc: 'Những đánh giá từ khách hàng.',
                fields: [
                    { path: 'testimonials.0.name', label: 'Tên Khách 1', type: 'text' },
                    { path: 'testimonials.0.quote', label: 'Đánh giá của Khách 1', type: 'textarea' },
                    { path: 'testimonials.1.name', label: 'Tên Khách 2', type: 'text' },
                    { path: 'testimonials.1.quote', label: 'Đánh giá của Khách 2', type: 'textarea' },
                    { path: 'testimonials.2.name', label: 'Tên Khách 3', type: 'text' },
                    { path: 'testimonials.2.quote', label: 'Đánh giá của Khách 3', type: 'textarea' }
                ]
            },
            'cv.phone': {
                title: 'Khu vực Contact (Liên hệ)',
                desc: 'Thông tin liên lạc ở cuối trang.',
                fields: [
                    { path: 'portfolio.cv.contact_heading', label: 'Tiêu đề liên hệ (VD: Let\'s talk for Something special)', type: 'text' },
                    { path: 'portfolio.cv.contact_sub', label: 'Mô tả lời mời liên hệ', type: 'textarea' },
                    { path: 'portfolio.cv.email', label: 'Địa chỉ Email', type: 'text' },
                    { path: 'portfolio.cv.phone', label: 'Số điện thoại', type: 'text' },
                    { path: 'portfolio.cv.behance', label: 'Link Behance', type: 'text' }
                ]
            },
            'footer': {
                title: 'Cài đặt Footer Website',
                desc: 'Chỉnh sửa đầy đủ nội dung, slogan, thông tin liên hệ, mạng xã hội và bản quyền ở chân trang.',
                fields: [
                    { path: 'footer.brand', label: 'Tên thương hiệu chính (Logo chữ ở giữa)', type: 'text' },
                    { path: 'footer.tagline', label: 'Câu Slogan / Mô tả chân trang', type: 'textarea' },
                    { path: 'footer.email', label: 'Email hiển thị ở Footer', type: 'text' },
                    { path: 'footer.phone', label: 'Số điện thoại hiển thị ở Footer', type: 'text' },
                    { path: 'footer.address', label: 'Địa chỉ / Khu vực hoạt động', type: 'text' },
                    { path: 'footer.facebook', label: 'Link Facebook (Icon Mạng xã hội)', type: 'text' },
                    { path: 'footer.instagram', label: 'Link Instagram (Icon Mạng xã hội)', type: 'text' },
                    { path: 'footer.behance', label: 'Link Behance (Icon Mạng xã hội)', type: 'text' },
                    { path: 'footer.discord', label: 'Link Discord (Icon Mạng xã hội)', type: 'text' },
                    { path: 'footer.bottom_brand', label: 'Tên thương hiệu thanh dưới cùng (Góc trái)', type: 'text' },
                    { path: 'footer.copyright', label: 'Bản quyền / Copyright (Góc phải)', type: 'text' }
                ]
            }
        };
