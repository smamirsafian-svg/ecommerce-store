function Get-Tree {
    param($Path, $Indent = '')
    $item = Get-Item $Path
    $name = $item.Name
    
    if ($name -ne 'node_modules' -and $name -ne '.next') {
        Write-Output ($Indent + $name)
        
        if ($item.PSIsContainer) {
            $children = Get-ChildItem $Path -Force | Where-Object { $_.Name -ne 'node_modules' -and $_.Name -ne '.next' } | Sort-Object Name
            $count = $children.Count
            
            for ($i = 0; $i -lt $count; $i++) {
                $child = $children[$i]
                $isLast = $i -eq ($count - 1)
                $prefix = if ($isLast) { '    ' } else { '|   ' }
                $connector = if ($isLast) { '`-- ' } else { '|-- ' }
                Get-Tree -Path $child.FullName -Indent ($Indent + $prefix + $connector)
            }
        }
    }
}

Get-Tree -Path . | Out-File -FilePath tree_output.txt -Encoding utf8
Write-Host "Tree saved to tree_output.txt"


