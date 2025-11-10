import {Wallet,PackageCheck,TrendingUp,AlertTriangle,BarChart4,UserPlus
} from "lucide-react";
import { useSelector } from "react-redux";

const MiniSummary = () => {
  const {topSellingProducts =[],
    lowStockProducts = 0,revenueGrowth="0",newUsersThisMonth=0,currentMonthSales=0,orderStatusCounts={}
  } = useSelector((state)=>state.admin);
  const totalOrders = Object.values(orderStatusCounts || {}).reduce((acc, count) => acc + count, 0);
  const summary=[
    {text:"total sales this Month",
      subText:`this month sales:PKR ${currentMonthSales * 283}`,
      icon:<Wallet className="text-green-600"/>,
    },
    {text:"total orders placed",
      subText:`this orders placed:PKR ${totalOrders}`,
      icon:<PackageCheck className="text-blue-600"/>,
    },
     {text:"Top Selling Product",
      subText:`Best Seller:PKR ${topSellingProducts[0]?.name || 'N/A'} (${topSellingProducts[0]?.total_sold || 0} sold)`,
      icon:<TrendingUp className="text-emerald-600"/>,
    },
    {text:"total sales this Month",
      subText:`this month sales:PKR ${currentMonthSales * 283}`,
      icon:<Wallet className="text-green-600"/>,
    },
    {text:"Low Stock Alerts",
      subText:`${lowStockProducts} products running low on Stock`,
      icon:<AlertTriangle className="text-red-600"/>,
    },
    {text:"Revenue Growth Rate",
      subText:`Revenue ${String(revenueGrowth).includes("+")?"up":"down"} by ${revenueGrowth} compares to last month`,
      icon:<BarChart4 className="text-purple-600"/>,
    },
    {text:"New Customers This month",
      subText:`New Customers joined:${newUsersThisMonth}`,
      icon:<UserPlus className="text-yellow-600"/>,
    },
  ];
  return <>
  
  <div className="bg-white rounded-xl p-6 shadown-md">
    <h2 className="text-lg font-semibold mb-2">Summary</h2>
    <p className="text-sm text-gray-500 mb-4">Summary of key metricc for the current month</p>
    <div className="space-y-4">
      {
        summary.map((item,index)=>{
          return (
            <div key={index}className="flex items-center space-x-3">
              {item.icon}
              <div>
                <p className="text-sm">{item.text}</p>
                <p className="text-sm text-gray-500">{item.subText}</p>
            </div>
            </div>
          )
        })
      }
    </div>
  </div>
  
  </>;
};

export default MiniSummary;