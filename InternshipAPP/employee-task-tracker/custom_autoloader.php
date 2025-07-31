<?php

/**
 * Custom Autoloader for Laravel Application
 * This file provides a clean autoloader without APCu dependencies
 */

class CustomClassLoader
{
    /**
     * @var array<string, array<string, int>>
     */
    private $prefixLengthsPsr4 = array();
    
    /**
     * @var array<string, list<string>>
     */
    private $prefixDirsPsr4 = array();
    
    /**
     * @var array<string, string>
     */
    private $classMap = array();
    
    /**
     * @var list<string>
     */
    private $fallbackDirsPsr4 = array();
    
    /**
     * @var bool
     */
    private $useIncludePath = false;
    
    /**
     * @var array<string, bool>
     */
    private $missingClasses = array();
    
    /**
     * Register this autoloader
     */
    public function register($prepend = false)
    {
        spl_autoload_register(array($this, 'loadClass'), true, $prepend);
    }
    
    /**
     * Unregister this autoloader
     */
    public function unregister()
    {
        spl_autoload_unregister(array($this, 'loadClass'));
    }
    
    /**
     * Load a class
     */
    public function loadClass($class)
    {
        if ($file = $this->findFile($class)) {
            include $file;
            return true;
        }
        return false;
    }
    
    /**
     * Find file for a class
     */
    public function findFile($class)
    {
        // Check if class is in missing classes cache
        if (isset($this->missingClasses[$class])) {
            return false;
        }
        
        // Check class map first
        if (isset($this->classMap[$class])) {
            return $this->classMap[$class];
        }
        
        // Try PSR-4
        $file = $this->findFileWithExtension($class, '.php');
        
        if (false === $file) {
            // Remember that this class does not exist
            $this->missingClasses[$class] = true;
        }
        
        return $file;
    }
    
    /**
     * Find file with extension
     */
    private function findFileWithExtension($class, $ext)
    {
        // PSR-4 lookup
        $logicalPathPsr4 = strtr($class, '\\', DIRECTORY_SEPARATOR) . $ext;
        
        $first = $class[0];
        if (isset($this->prefixLengthsPsr4[$first])) {
            $subPath = $class;
            while (false !== $lastPos = strrpos($subPath, '\\')) {
                $subPath = substr($subPath, 0, $lastPos);
                $search = $subPath . '\\';
                if (isset($this->prefixDirsPsr4[$search])) {
                    $pathEnd = DIRECTORY_SEPARATOR . substr($logicalPathPsr4, $lastPos + 1);
                    foreach ($this->prefixDirsPsr4[$search] as $dir) {
                        if (file_exists($file = $dir . $pathEnd)) {
                            return $file;
                        }
                    }
                }
            }
        }
        
        // PSR-4 fallback dirs
        foreach ($this->fallbackDirsPsr4 as $dir) {
            if (file_exists($file = $dir . DIRECTORY_SEPARATOR . $logicalPathPsr4)) {
                return $file;
            }
        }
        
        return false;
    }
    
    /**
     * Set PSR-4 prefix
     */
    public function setPsr4($prefix, $paths)
    {
        if (!$prefix) {
            $this->fallbackDirsPsr4 = (array) $paths;
        } else {
            $length = strlen($prefix);
            if ('\\' !== $prefix[$length - 1]) {
                throw new \InvalidArgumentException("A non-empty PSR-4 prefix must end with a namespace separator.");
            }
            $this->prefixLengthsPsr4[$prefix[0]][$prefix] = $length;
            $this->prefixDirsPsr4[$prefix] = (array) $paths;
        }
    }
    
    /**
     * Add to class map
     */
    public function addClassMap(array $classMap)
    {
        if ($this->classMap) {
            $this->classMap = array_merge($this->classMap, $classMap);
        } else {
            $this->classMap = $classMap;
        }
    }
    
    /**
     * Get class map
     */
    public function getClassMap()
    {
        return $this->classMap;
    }
    
    /**
     * Get PSR-4 prefixes
     */
    public function getPrefixesPsr4()
    {
        return $this->prefixDirsPsr4;
    }
}