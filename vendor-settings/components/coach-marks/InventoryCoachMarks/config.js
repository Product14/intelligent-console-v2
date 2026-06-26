export const coachMarksTypography = {
    "cat_d8R14zUNE": {
        "arrowImage": "https://spyne-static.s3.amazonaws.com/console/icons/whiteCurvedArrow.svg",
        "step_2_heading": "Click here to view My Vehicles",
        "step_2_subheading": "Your projects section has been moved to my vehicles now.",
        "step_3_heading": "Click here to view your VIN",
        "step_3_subheading": "Your vehicle details & media are integrated from your VIN number",
        "step_4_heading": "Vehicle Info",
        "step_4_subheading": "All details of your vehicle are listed here which can be managed for your website",
        "step_5_heading": "Images",
        "step_5_subheading": "You can view your vehicle images here",
        "step_6_heading": "360 Spin",
        "step_6_subheading": "You can view your 360 Spin of your vehicle here",
        "step_7_heading": "Vehicle Logs",
        "step_7_subheading": "Changes made in vehicle info by user would be reflected here",
        "step_8_heading": "Silent Salesman",
        "step_8_subheading": "You can generate sticker for this vehicle here",
        "step_9_heading": "Woohoo ! You are all set to manage your inventory",
    } 
}

export const showProgress = (itemCurrent, completedStep) => {
    try {
        let tempCssClass = `bg-white-20`
        if(itemCurrent <= completedStep) {
            tempCssClass = `bg-white`
        }
        
        return tempCssClass
    } catch (error) {
        console.log(error)
    }
}
