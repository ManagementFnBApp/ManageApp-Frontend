'use client'
import { getAllCategories, getAllProducts } from "@/apis/test";
import { Button } from "@/components/ui/button";
import { BASE_URL } from "@/global-configs";
import { useEffect } from "react";

export default function Homepage() {
    async function fetchCategory() {
        const data = await getAllCategories();
        console.log(data);
    }

    async function fetchProduct() {
        const data = await getAllProducts();
        console.log(data);
    }
    useEffect(() => {
        console.log(BASE_URL);
    }, []);

    const handleCategoryClick = () => {
        fetchCategory();
    }

    const handleProductClick = () => {
        fetchProduct()
    }

    return (
        <>
            <div>Homepage</div>
            <Button onClick={handleCategoryClick}>Category</Button>
            <Button onClick={handleProductClick}>Product</Button>
        </>
    )
}