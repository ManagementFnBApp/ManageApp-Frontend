import './404.css'

export default function NotFoundPage() {
    return (
        <>
            <div id="clouds">
                <div className="cloud x1"></div>
                <div className="cloud x1_5"></div>
                <div className="cloud x2"></div>
                <div className="cloud x3"></div>
                <div className="cloud x4"></div>
                <div className="cloud x5"></div>
            </div>
            <div className='c'>
                <div className='_404'>404</div>
                <br />
                <div className='_1'>TRANG</div>
                <div className='_2'>KHÔNG TÌM THẤY</div>
                <a className='btn' href='#'>QUAY LẠI TRANG CHỦ</a>
            </div>
        </>
    );
};